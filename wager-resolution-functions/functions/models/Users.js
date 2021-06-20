const { firestore } = require('@/services/firebase');
const { snakeToCamel, camelToSnake } = require('@/utils/format');
const ModelError = require('./errors');

const COLLECTION = 'users';
const dbRef = firestore.collection(COLLECTION);

/**
 * Get a user doc by id
 * @param {String} id
 */
const getUser = async (id) => {
  try {
    const doc = await dbRef.doc(id).get();
    if (!doc.exists) {
      throw new Error(ModelError.noDocumentError());
    }

    return snakeToCamel(doc.data());
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

/**
 * Get a list of users
 */
const getUsers = async () => {
  try {
    const snapshot = await dbRef.where('active', '==', true).get();

    if (snapshot.empty) return [];

    const docs = [];
    snapshot.forEach((doc) =>
      docs.push({
        _id: doc.id,
        ...snakeToCamel(doc.data()),
      }),
    );
    return docs;
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

const updateUser = async (param = {}) => {
  try {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnake(updateParam);
    await dbRef.doc(id).update(formattedParam);
    return;
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

module.exports = {
  getUser,
  getUsers,
  updateUser,
};
