const { firestore } = require('@/services/firebase');
const ModelError = require('./errors');

const COLLECTION = 'service_credentials';
const dbRef = firestore.collection(COLLECTION);

const getActiveCredential = async () => {
  try {
    const snapshot = await dbRef.where('active', '==', true).where('group', '==', 'wz-callofduty').get();

    if (snapshot.empty) {
      throw new Error(ModelError.noDocumentError());
    }

    const accounts = [];
    snapshot.forEach((doc) => accounts.push(doc.data()));
    return accounts[0];
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

module.exports = {
  getActiveCredential,
};
