const codApi = require('call-of-duty-api')();
const dayjs = require('@/services/dayjs');
const ServiceCredentials = require('@/models/ServiceCredentials');
// const Users = require('@/models/Users');
const Wagers = require('@/models/Wagers');
const { asyncForEach } = require('@/utils/request');
const { round } = require('@/utils/math');
// const { findUserMatch } = require('./CodMatch');

const login = async () => {
  const credential = await ServiceCredentials.getActiveCredential();
  await codApi.login(credential.email, credential.password);
};

const fuzzySearch = (text, platform = codApi.platforms.uno) => {
  return codApi.FuzzySearch(text, platform);
};

const usernameMatch = (accounts, username) =>
  accounts && accounts.length > 0 && accounts[0].username.toLowerCase() === username.toLowerCase();

class CodUser {
  constructor(ctx) {
    this.reqBody = ctx.req.body;
  }

  async validateIds() {
    await login();
    const { usernames } = this.reqBody;
    const invalidUsers = [];

    await asyncForEach(usernames, async (data) => {
      const { username, platform } = data;
      const result = await fuzzySearch(username, codApi.platforms[platform]);
      if (!usernameMatch(result, username)) invalidUsers.push(data);
    });

    return {
      status: 200,
      body: {
        result: invalidUsers,
      },
    };
  }

  async getPerformance() {
    await login();
    const { id, period } = this.reqBody;
    const metric = {
      wagersWon: 0,
      wagersLost: 0,
      wagersTotal: 0,
      dollarsWon: 0,
      dollarsLost: 0,
      betsBelow10: 0,
      bets11To30: 0,
      betsAbove30: 0,
    };

    // const user = await Users.getUser(id);
    // const matches = await findUserMatch({ user });
    // console.log(matches.length);

    const utcOffsetDate = dayjs().utc().subtract(period, 'day');
    const wagers = await Wagers.getWagers({
      userId: id,
      status: 'resolved',
      datetimeQuery: new Date(utcOffsetDate),
      limit: 1000,
    });

    wagers.forEach((wager) => {
      const { amount, payout, outcome } = wager;

      metric.wagersTotal += 1;

      if (outcome === 'won') {
        metric.wagersWon += 1;
        metric.dollarsWon += payout;
      } else if (outcome === 'lost') {
        metric.wagersLost += 1;
        metric.dollarsLost += amount;
      }

      if (amount < 11) {
        metric.betsBelow10 += 1;
      } else if (amount < 31) {
        metric.bets11To30 += 1;
      } else if (amount > 30) {
        metric.betsAbove30 += 1;
      }
    });

    const result = {
      ...metric,
      dollarsWon: round(metric.dollarsWon, 2),
      dollarsLost: round(metric.dollarsLost, 2),
      winRate: round(metric.wagersWon / metric.wagersTotal, 2),
      revenue: round(metric.dollarsWon - metric.dollarsLost, 2),
    };

    return {
      status: 200,
      body: {
        result,
      },
    };
  }
}

module.exports = CodUser;
