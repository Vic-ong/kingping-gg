import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { camelToSnakeObject, snakeToCamelObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { TournamentStates, Tournament } from './types';

const COLLECTION = 'tournaments';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<TournamentStates, RootState> = {
  getTournament: (store, param) => {
    store.commit('TOURNAMENT_LOADING');
    return docRef.doc(param).onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const payload = docSnapshot.data() || {};
          store.commit('TOURNAMENT_LOADED', snakeToCamelObject(payload));
        } else {
          store.commit('TOURNAMENT_ERROR');
          console.error('Unable to find document!');
        }
      },
      (err) => {
        store.commit('TOURNAMENT_ERROR');
        throw err;
      },
    );
  },
  getTournamentList: (store) => {
    store.commit('TOURNAMENTS_LOADING');
    const query = docRef.orderBy('created_at', 'desc');
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('TOURNAMENTS_ERROR');
          console.error('No matching documents.');
          return;
        }
        const payload: Tournament[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as Tournament;
          if (data)
            payload.push({
              ...data,
              _id: doc.id,
            });
        });
        store.commit('TOURNAMENTS_LOADED', payload);
      },
      (err) => {
        store.commit('TOURNAMENTS_ERROR');
        throw err;
      },
    );
    return observer;
  },
  createTournament: (store, param) => {
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
  updateTournament: (store, param) => {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnakeObject(updateParam);
    return docRef
      .doc(id)
      .update(formattedParam)
      .then(() => {
        store.commit('TOURNAMENT_UPDATED', updateParam);
      })
      .catch((err) => {
        throw err;
      });
  },
  updateTournamentList: (store, param) => {
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
            const data = doc.data() as Tournament;
            const payload = {
              ...data,
              _id: doc.id,
            };
            store.commit('TOURNAMENTS_UPDATED', snakeToCamelObject(payload));
          });
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default actions;
