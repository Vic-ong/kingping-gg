const dayjs = require('@/services/dayjs');
const { snakeToCamel, camelToSnake } = require('@/utils/format');
const { firestore } = require('@/services/firebase');
const ModelError = require('./errors');

const COLLECTION = 'wagers';
const dbRef = firestore.collection(COLLECTION);

const defaultDatetimeQuery = () => {
  const utcOffsetDate = dayjs().utc().subtract(1, 'hour').subtract(20, 'minute');
  return new Date(utcOffsetDate);
};

/**
 * Get a wager doc by id
 * @param {String} id
 */
const getWager = async (id) => {
  try {
    const doc = await dbRef.doc(id).get();
    if (!doc.exists) return undefined;

    return {
      id,
      ...snakeToCamel(doc.data()),
    };
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

/**
 * Get a list of wagers
 */
const getWagers = async (params = {}) => {
  try {
    const { outcome, status, userId, datetimeQuery = defaultDatetimeQuery(), limit = 10 } = params;

    let query = dbRef;
    if (outcome) query = query.where('outcome', '==', outcome);
    if (status) query = query.where('status', '==', status);
    if (userId) query = query.where('user._id', '==', userId);

    const snapshot = await query.where('created_at', '>=', datetimeQuery).limit(limit).get();

    if (snapshot.empty) return [];

    const docs = [];
    snapshot.forEach((doc) =>
      docs.push({
        id: doc.id,
        ...snakeToCamel(doc.data()),
      }),
    );
    return docs;
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

const updateWager = async (param = {}) => {
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
  getWager,
  getWagers,
  updateWager,
};
