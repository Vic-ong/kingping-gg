const contractPoints = {
  domination: 1,
  timedrun: 1,
  scavenger: 2,
  bounty: 3,
  vip: 4,
};

const getContractPoints = (contracts) => {
  let totalPoints = 0;
  Object.keys(contracts).forEach((type) => {
    const points = contractPoints[type] || 0;
    totalPoints += points * contracts[type];
  });

  return totalPoints;
};

const getContractsCount = (match) => {
  const missions = match.player.brMissionStats.missionStatsByType;

  if (missions) {
    const types = Object.keys(missions);
    if (types && types.length > 0) {
      const contracts = {};
      types.forEach((type) => {
        contracts[type] = missions[type].count || 0;
      });
      return contracts;
    }
  }
  return undefined;
};

const getKioskBuy = (match) => {
  const { objectiveBrKioskBuy } = match.playerStats;
  return objectiveBrKioskBuy || 0;
};

const getKillCount = (match) => match.playerStats.kills;

const getPlacement = (match) => match.playerStats.teamPlacement;

class WagerVerdict {
  constructor(wager, match) {
    const { user, partyIds, bettingOdds } = wager;
    const { _id, criteria } = bettingOdds;
    this.user = user;
    this.partyIds = partyIds;
    this.betId = _id;
    this.criteria = criteria;
    this.match = match;
    this.userMatchData = null;
    this.teamMatchData = null;

    this.filterMatchByPlayersTeam();
  }

  /**
   * Filter match data by player and team
   */
  filterMatchByPlayersTeam() {
    const codUsername = this.getUsername(this.user.activisionId);
    const userMatchData = this.match.allPlayers.find((m) => this.usernameMatches(m, codUsername));
    this.userMatchData = userMatchData;

    const { team } = userMatchData.player;
    this.teamMatchData = this.match.allPlayers.filter((m) => m.player.team === team);
  }

  getVerdict() {
    if (this.betId.includes('kills_')) {
      return this.placementAndKills();
    }
    if (this.betId.includes('tournament_')) {
      return this.tournamentData();
    }
    console.log(`Invalid Bet: ${this.betId}`);
    return undefined;
  }

  /**
   * Find the verdict for placement and kills
   */
  placementAndKills() {
    let won = false;
    const details = {};

    const valid = this.verifyTeammates();
    if (valid) {
      const { kills, placement } = this.criteria;

      const userKills = getKillCount(this.userMatchData);
      details.kills = userKills;

      if (!placement) {
        won = userKills >= kills;
      } else {
        const userPlacement = getPlacement(this.userMatchData);
        details.placement = userPlacement;

        won = userKills >= kills && userPlacement <= placement;
      }
    }

    return { verdict: this.setVerdict(won), details };
  }

  /**
   * Find verdict for kiosk buy
   */
  placementAndKioskBuy() {
    let won = false;
    const details = {};

    const valid = this.verifyTeammates();
    if (valid) {
      const { placement, kioskbuy } = this.criteria;

      const userPlacement = getPlacement(this.userMatchData);
      details.placement = userPlacement;

      const sumOfKioskBuy = this.teamMatchData.reduce((acc, curr) => acc + getKioskBuy(curr), 0);
      details.kioskbuy = sumOfKioskBuy;

      won = userPlacement <= placement && sumOfKioskBuy <= kioskbuy;
    }

    return { verdict: this.setVerdict(won), details };
  }

  /**
   * Get match outcome for tournament
   */
  tournamentData() {
    const details = {};

    const valid = this.verifyTeammates();
    if (valid) {
      const userKills = getKillCount(this.userMatchData);
      details.kills = userKills;

      const userPlacement = getPlacement(this.userMatchData);
      details.placement = userPlacement;

      const sumOfKioskBuy = this.teamMatchData.reduce((acc, curr) => acc + getKioskBuy(curr), 0);
      details.kioskbuy = sumOfKioskBuy;

      const contracts = getContractsCount(this.userMatchData);
      if (contracts) {
        const sumOfPoints = getContractPoints(contracts);
        details.points = sumOfPoints;
        details.contracts = contracts;
      }
    }

    return { verdict: 'no_verdict', details };
  }

  setVerdict(won) {
    return won ? 'won' : 'lost';
  }

  getUsername(activisionId) {
    const hashIndex = activisionId.lastIndexOf('#');
    return hashIndex === -1 ? activisionId : activisionId.substring(0, hashIndex);
  }

  usernameMatches(userMatch, username) {
    return userMatch.player.username.toLowerCase() === username.toLowerCase();
  }

  verifyTeammates() {
    const usernameExist = (id) => {
      const codUsername = this.getUsername(id);
      return this.teamMatchData.findIndex((m) => this.usernameMatches(m, codUsername)) !== -1;
    };
    return this.partyIds.every(usernameExist);
  }
}

module.exports = WagerVerdict;
