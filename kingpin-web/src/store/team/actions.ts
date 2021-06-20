import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { snakeToCamelObject, camelToSnakeObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { User } from '@/store/profile/types';
import { TeamState, Team } from './types';

interface Members {
  activisionId: string;
  platformId: {
    platform: string;
    username: string;
  };
}

const COLLECTION = 'teams';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<TeamState, RootState> = {
  getTeam: async (store, id) => {
    store.commit('SET_LOADING_TEAM');

    const query = docRef.where('user_ids', 'array-contains', id);
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('SET_LOADED_TEAM', { name: undefined, members: [] });
          return;
        }
        const data: Team[] = [];
        querySnapshot.forEach((doc) => {
          data.push(snakeToCamelObject({ _id: doc.id, ...doc.data() }) as Team);
        });
        const [teamData] = data;

        db.collection('users')
          .where('_id', 'in', teamData.userIds)
          .onSnapshot(
            (usersSnapshot) => {
              const members: Members[] = [];
              usersSnapshot.forEach((userDoc) => {
                const userData = snakeToCamelObject(userDoc.data() as User);
                members.push({
                  activisionId: userData.activisionId,
                  platformId: userData.platformId,
                });
              });
              store.commit('SET_LOADED_TEAM', { ...teamData, members });
            },
            (err) => {
              store.commit('SET_ERROR_TEAM');
              throw err;
            },
          );
      },
      (err) => {
        store.commit('SET_ERROR_TEAM');
        throw err;
      },
    );
    return observer;
  },
  getTeams: async (store) => {
    store.commit('SET_LOADING');
    const observer = docRef.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('SET_ERROR');
          console.error('No matching documents.');
          return;
        }
        const payload: Team[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as Team;
          if (data) payload.push({ ...data, _id: doc.id });
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
  updateTeam: async (store, param) => {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnakeObject(updateParam);
    return docRef.doc(id).update(formattedParam);
  },
};

export default actions;
