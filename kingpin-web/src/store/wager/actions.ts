import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { camelToSnakeObject, snakeToCamelObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { WagerStates, Wager } from './types';

const COLLECTION = 'wagers';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<WagerStates, RootState> = {
  getWager: (store, param) => {
    store.commit('WAGER_LOADING');
    return docRef.doc(param).onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const payload = docSnapshot.data() || {};
          store.commit('WAGER_LOADED', snakeToCamelObject(payload));
        } else {
          store.commit('WAGER_ERROR');
          console.error('Unable to find document!');
        }
      },
      (err) => {
        store.commit('WAGER_ERROR');
        throw err;
      },
    );
  },
  getWagersByUser: async (store, param) => {
    store.commit('USER_WAGERS_LOADING');
    const query = docRef.where('user._id', '==', param.userId).orderBy('created_at', 'desc').limit(param.limit);
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('USER_WAGERS_LOADED', []);
          console.error('No matching documents.');
          return;
        }
        const payload: Wager[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as Wager;
          if (data)
            payload.push({
              ...data,
              _id: doc.id,
            });
        });
        store.commit('USER_WAGERS_LOADED', payload);
      },
      (err) => {
        store.commit('USER_WAGERS_ERROR');
        throw err;
      },
    );
    return observer;
  },
  getWagerList: async (store, param = { limit: 100 }) => {
    store.commit('WAGERS_LOADING');
    const query = docRef.orderBy('updated_at', 'desc').limit(param.limit);
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('WAGERS_ERROR');
          console.error('No matching documents.');
          return;
        }
        const payload: Wager[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as Wager;
          if (data)
            payload.push({
              ...data,
              _id: doc.id,
            });
        });
        store.commit('WAGERS_LOADED', payload);
      },
      (err) => {
        store.commit('WAGERS_ERROR');
        throw err;
      },
    );
    return observer;
  },
  createWager: (store, param) => {
    const formattedParam = camelToSnakeObject(param);
    return docRef
      .add(formattedParam)
      .then((res) => {
        return res.id;
      })
      .catch((err) => {
        throw err;
      });
  },
  updateWager: (store, param) => {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnakeObject(updateParam);
    return docRef
      .doc(id)
      .update(formattedParam)
      .then(() => {
        store.commit('WAGER_UPDATED', updateParam);
      })
      .catch((err) => {
        throw err;
      });
  },
  updateWagerList: (store, param) => {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnakeObject(updateParam);
    return docRef
      .doc(id)
      .update(formattedParam)
      .then(() => {
        docRef
          .doc(id)
          .get()
          .then((doc) => {
            const data = doc.data() as Wager;
            const payload = {
              ...data,
              _id: doc.id,
            };
            store.commit('WAGERS_UPDATED', snakeToCamelObject(payload));
          });
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default actions;
