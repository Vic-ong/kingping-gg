const { firestore } = require('@/services/firebase');
const { camelToSnake } = require('@/utils/format');
const ModelError = require('./errors');

const COLLECTION = 'transactions';
const dbRef = firestore.collection(COLLECTION);

/**
 * Create a transaction record
 * @param {
 *  amount: Number,
 *  description: String,
 *  user: Object,
 * } param
 */
const createTransaction = async (param) => {
  try {
    const currentDate = new Date();
    const formattedParam = camelToSnake({
      ...param,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
    await dbRef.add(formattedParam);
  } catch (err) {
    console.log(ModelError.generalError(COLLECTION, err));
    throw err;
  }
};

module.exports = {
  createTransaction,
};
