require('module-alias/register');

const functions = require('firebase-functions');

const WagerResolve = require('@/controllers/WagerResolve');
const app = require('./app');

// API
exports.api = functions.https.onRequest(app.callback());

// Schedulers
exports.resolveWagers = functions.pubsub.schedule('every 10 minutes').onRun(async () => {
  new WagerResolve().resolveWagers();
});
