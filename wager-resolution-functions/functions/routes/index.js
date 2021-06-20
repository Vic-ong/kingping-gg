const Router = require('koa-router');

// controllers
const h = require('./handlers');

// Config for API routing -- router.use(path, middlewares, routing function)
const router = new Router();

// Routes
router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    message: 'TEST ok',
  };
});

const routerConfigs = [
  {
    route: '/resolve/wagersByIds',
    method: 'post',
    handler: h.resolveWagersByIdsHandler,
  },
  {
    route: '/fullmatch',
    method: 'post',
    handler: h.findFullMatchHandler,
  },
  {
    route: '/user/performance',
    method: 'post',
    handler: h.getUserPerformanceHandler,
  },
  {
    route: '/validateCodUsers',
    method: 'post',
    handler: h.validateCodUsersHandler,
  },
];

if (process.env.FUNCTIONS_EMULATOR) {
  routerConfigs.push({
    route: '/resolve/wagers',
    method: 'post',
    handler: h.resolveWagersHandler,
  });
}

routerConfigs.forEach(({ route, method, handler }) => {
  router[method](route, async (ctx) => {
    const { status, body } = await handler(ctx);
    ctx.status = status;
    ctx.body = body;
  });
});

module.exports = router;
