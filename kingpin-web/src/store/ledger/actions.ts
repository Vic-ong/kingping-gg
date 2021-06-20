import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { camelToSnakeObject, snakeToCamelObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { LedgerState, Transaction } from './types';

const COLLECTION = 'transactions';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<LedgerState, RootState> = {
  getTransactions: async (store) => {
    store.commit('SET_LOADING');
    const query = docRef.orderBy('created_at', 'desc');
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('SET_ERROR');
          console.error('No matching documents.');
          return;
        }
        const payload: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as Transaction;
          if (data)
            payload.push({
              ...data,
              _id: doc.id,
            });
        });
        store.commit('SET_LOADED', payload);
      },
      (err) => {
        store.commit('SET_ERROR');
        throw err;
      },
    );
    return observer;
  },
  createTransaction: (store, param) => {
    const formattedParam = camelToSnakeObject(param);
    return docRef
      .add(formattedParam)
      .then((res) => {
        docRef
          .doc(res.id)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const payload = doc.data() || {};
              store.commit(
                'SET_CREATED',
                snakeToCamelObject({
                  ...payload,
                  _id: res.id,
                }),
              );
            } else {
              store.commit('SET_ERROR');
              console.error('Unable to find document!');
            }
          });
        return res.id;
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default actions;
