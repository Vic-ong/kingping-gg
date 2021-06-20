const WagerResolve = require('@/controllers/WagerResolve');
const CodMatch = require('@/controllers/CodMatch');
const CodUser = require('@/controllers/CodUser');

const resolveWagersHandler = (ctx) => {
  const { config } = ctx.req.body;

  return new WagerResolve(config).resolveWagers();
};

const resolveWagersByIdsHandler = (ctx) => {
  const { config, ids } = ctx.req.body;

  return new WagerResolve(config).resolveWagersByIds(ids);
};

const findFullMatchHandler = (ctx) => {
  const { id, platformId, activisionId } = ctx.req.body;

  return CodMatch.findFullMatch(id, platformId, activisionId);
};

const validateCodUsersHandler = (ctx) => new CodUser(ctx).validateIds();

const getUserPerformanceHandler = (ctx) => new CodUser(ctx).getPerformance();

module.exports = {
  resolveWagersHandler,
  resolveWagersByIdsHandler,
  findFullMatchHandler,
  validateCodUsersHandler,
  getUserPerformanceHandler,
};
