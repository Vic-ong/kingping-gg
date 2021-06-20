// const codApi = require('call-of-duty-api')();
// const dayjs = require('@/services/dayjs');
// const ServiceCredentials = require('@/models/ServiceCredentials');
// const Users = require('@/models/Users');
// const Wagers = require('@/models/Wagers');
// const { asyncForEach } = require('@/utils/request');
// const { round } = require('@/utils/math');
// const { findUserMatch } = require('./CodMatch');

// const login = async () => {
//   const credential = await ServiceCredentials.getActiveCredential();
//   await codApi.login(credential.email, credential.password);
// };

class WagerSelections {
  constructor(ctx) {
    this.reqBody = ctx.req.body;
  }

  getKillRecords() {
    // const endTime = 0;
    // const maxRecords = 50;
    // const records = { kills: [], kd_ratios: [] };
    // const prevMatchEmpty = false;
    // const consecutiveEmpty = 1;
    // const maxConsecutiveEmpty = 2;
    // const currentPage = 0;
    // const maxPages = 5;
  }

  isValidMatch(match) {
    const { mode, playerStats } = match;

    if (!mode || !playerStats) return false;

    let modeMatches = false;
    if (this.mode === 'br_solo') {
      modeMatches = true;
    } else if (this.mode === 'br_brduos') {
      modeMatches = ['br_brduos', 'br_brtrios'].any((m) => mode === m);
    } else if (this.mode === 'br_brtrios') {
      modeMatches = ['br_brduos', 'br_brtrios', 'br_brquads'].any((m) => mode === m);
    } else if (this.mode === 'br_brquads') {
      modeMatches = ['br_brtrios', 'br_brquads'].any((m) => mode === m);
    } else {
      modeMatches = mode === this.mode;
    }

    return modeMatches && playerStats.kills >= this.minKills;
  }
}

module.exports = WagerSelections;
