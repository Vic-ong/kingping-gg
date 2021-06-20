const firebase = require('firebase-admin');
const config = require('./config');

firebase.initializeApp({
  credential: firebase.credential.cert(config),
  databaseURL: `https://${config.project_id}.firebaseio.com`,
});

const firestore = firebase.firestore();

module.exports = {
  firebase,
  firestore,
};
