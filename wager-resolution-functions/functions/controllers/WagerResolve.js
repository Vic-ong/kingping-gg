const { asyncForEach } = require('@/utils/request');
const dayjs = require('@/services/dayjs');
const Slack = require('@/models/Slack');
const Wagers = require('@/models/Wagers');
const Teams = require('@/models/Teams');
const UserBalance = require('./UserBalance');
const CodMatch = require('./CodMatch');
const WagerVerdict = require('./WagerVerdict');

const getCurrentTime = () => dayjs().utc().unix() * 1000;

const getDatetimeQuery = () => {
  const utcOffsetDate = dayjs().utc().subtract(1, 'hour').subtract(20, 'minute');
  return new Date(utcOffsetDate);
};

const wagerExpired = (currentTime, startTime) => currentTime - startTime > 60 * 60 * 1000;

class WagerResolve {
  constructor(config = {}) {
    const { dryRun, skipExpiredCheck, skipSlackMessage } = config;
    this.dryRun = dryRun;
    this.skipExpiredCheck = skipExpiredCheck;
    this.skipSlackMessage = skipSlackMessage;
    this.currentDate = new Date();
    this.currentTime = getCurrentTime();
    this.slackChannel = process.env.SLACK_MATCH_OUTCOME_CHANNEL;
    this.slackMsg = [];
    this.metadata = {
      total: 0,
      won: 0,
      lost: 0,
      expired: 0,
      pending: 0,
    };

    if (dryRun) console.log('\n*** DRY RUN ***\n');
  }

  /**
   * Get wager documents and execute resolveWager
   */
  async resolveWagers() {
    const wagers2 = await Wagers.getWagers({
      outcome: 'pending',
      status: '',
      datetimeQuery: getDatetimeQuery(),
      limit: 100,
    });

    const betKeywords = ['placement_', 'kills_', 'tournament_'];

    const wagers = wagers2.filter((w) => {
      return betKeywords.some((keyword) => w.bettingOdds._id.includes(keyword));
    });

    if (wagers.length > 0) {
      await asyncForEach(wagers, async (wager) => {
        this.currentDate = new Date();
        this.currentTime = getCurrentTime();
        this.slackMsg = [];

        await this.resolveWager(wager);
      });
    }

    return {
      status: 200,
      body: {
        metadata: this.metadata,
      },
    };
  }

  /**
   * Resolve specific wager
   * @param { String } id
   */
  async resolveWagersByIds(ids) {
    await asyncForEach(ids, async (id) => {
      this.currentDate = new Date();
      this.currentTime = getCurrentTime();
      this.slackMsg = [];

      const wager = await Wagers.getWager(id);
      if (wager) await this.resolveWager(wager);
    });

    return {
      status: 200,
      body: {
        metadata: this.metadata,
      },
    };
  }

  async resolveWager(wager) {
    const { id, user, bettingOdds, status, payout, createdAt } = wager;
    const username = `${user.firstName} ${user.lastName}`;
    const startTime = Math.round(createdAt.Seconds * 1000);
    const endTime = startTime + 60 * 60 * 1000;

    this.metadata.total += 1;

    this.logMsg(`Wager: ${bettingOdds.name} (${id})\nUser: ${username}, ${user.activisionId} (${user._id})`);

    if (!this.skipExpiredCheck && wagerExpired(this.currentTime, startTime)) {
      await this.resolveExpiredWager(wager);
      this.metadata.expired += 1;
      return;
    }

    const match = await CodMatch.findClosestMatch({
      wager,
      partition: { startTime, endTime },
      allPlayers: true,
    });

    // no match found
    if (!match) {
      this.metadata.pending += 1;
      console.log('No match found\n');
      return;
    }

    // find match verdict
    const { verdict, details } = new WagerVerdict(wager, match).getVerdict();
    this.logMsg(`Scores: ${JSON.stringify(details)}`);
    const wagerUpdateParam = {
      id,
      matchId: match.matchID,
      outcome: verdict,
      outcomeDetails: details,
      status: status === 'user_concede_defeat' ? 'user_concede_defeat' : 'resolved',
      updatedAt: this.currentDate,
    };

    // update documents
    this.logMsg(`Match: ${match.matchID}`);

    if (this.dryRun) {
      console.log('\n=== Update Wager ===');
      console.log(wagerUpdateParam);
    } else {
      await Wagers.updateWager(wagerUpdateParam);
    }

    if (verdict === 'won') {
      const userUpdateParam = {
        user,
        amount: payout,
        remark: 'wager payout',
      };
      const { balance, prevBalance } = await UserBalance.updateUserBalance(userUpdateParam, this.dryRun);
      this.logBalanceUpdate(balance, prevBalance);
    }

    if (this.metadata[verdict] !== undefined) this.metadata[verdict] += 1;
    this.logVerdict(verdict);
    await this.sendSlackMessage();
  }

  async resolveExpiredWager(wager) {
    const { id, user, amount, bettingOdds } = wager;
    const { _id: betId } = bettingOdds;
    const wagerUpdateParam = {
      id,
      outcome: 'invalid',
      status: 'no_matches_found',
      updatedAt: this.currentDate,
    };
    const userUpdateParam = {
      user,
      amount,
      remark: 'wager expired',
    };

    if (this.dryRun) {
      console.log('\n=== Update Wager ===');
      console.log(wagerUpdateParam);
    } else {
      const { balance, prevBalance } = await UserBalance.updateUserBalance(userUpdateParam, this.dryRun);
      this.logBalanceUpdate(balance, prevBalance);
      await Wagers.updateWager(wagerUpdateParam);
    }

    if (betId.includes('tournament_')) {
      const { teamId } = wager;

      const team = await Teams.getTeam(teamId);

      const teamUpdateParam = {
        id: teamId,
        count: team.count - 1,
        updatedAt: this.currentDate,
      };
      if (this.dryRun) {
        console.log('\n=== Update Team ===');
        console.log(teamUpdateParam);
      } else {
        await Teams.updateTeam(teamUpdateParam);
      }
    }

    this.logVerdict('expired');
    await this.sendSlackMessage();
  }

  // Log messages and add them to slack messages
  async logMsg(msg) {
    console.log(msg);
    this.slackMsg.push(msg);
  }

  async logBalanceUpdate(balance, prevBalance) {
    this.logMsg(`Transaction: $${prevBalance} --> $${balance}`);
  }

  async logVerdict(verdict) {
    const verdicts = {
      won: 'Won',
      lost: 'Lost',
      expired: 'Expired',
    };
    this.logMsg(`Verdict: ${verdicts[verdict]}\n`);
  }

  // Format and send slack messages
  async sendSlackMessage() {
    if (!this.skipSlackMessage) {
      let prefix = '';
      if (this.dryRun) prefix = 'dry run';
      if (this.skipExpiredCheck) prefix += ', skip expired check';

      const prefixFormatted = prefix ? `\`TEST: ${prefix}\`\n` : '';
      const text = `${prefixFormatted}${this.currentDate}\n\`\`\`${this.slackMsg.join('\n')}\`\`\``;

      await Slack.postMessage(this.slackChannel, text);
    }
  }
}

module.exports = WagerResolve;
