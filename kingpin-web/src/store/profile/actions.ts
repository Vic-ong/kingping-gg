import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { camelToSnakeObject, snakeToCamelObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { ProfileState, User } from './types';

const COLLECTION = 'users';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<ProfileState, RootState> = {
  getUser: (store, param) => {
    store.commit('PROFILE_LOADING');
    return docRef.doc(param).onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const payload = docSnapshot.data() || {};
          store.commit('PROFILE_LOADED', snakeToCamelObject(payload));
        } else {
          store.commit('PROFILE_ERROR');
          console.error('Unable to find document!');
        }
      },
      (err) => {
        store.commit('PROFILE_ERROR');
        throw err;
      },
    );
  },
  getUserList: (store) => {
    store.commit('USERS_LOADING');
    const query = docRef.orderBy('updated_at', 'desc');
    const observer = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.empty) {
          store.commit('USERS_ERROR');
          console.error('No matching documents.');
          return;
        }
        const payload: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = snakeToCamelObject(doc.data()) as User;
          if (data) payload.push(data);
        });
        store.commit('USERS_LOADED', payload);
      },
      (err) => {
        store.commit('USERS_ERROR');
        throw err;
      },
    );
    return observer;
  },
  createUser: (store, param) => {
    const formattedParam = camelToSnakeObject(param);
    return docRef
      .doc(formattedParam._id)
      .set(formattedParam)
      .then(() => {
        console.log('Created profile');
      })
      .catch((err) => {
        console.error('Error creating document: ', err);
      });
  },
  updateUser: (store, param) => {
    const { id, ...updateParam } = param;
    const formattedParam = camelToSnakeObject(updateParam);
    return docRef
      .doc(id)
      .update(formattedParam)
      .then(() => {
        store.commit('PROFILE_UPDATED', updateParam);
      })
      .catch((err) => {
        throw err;
      });
  },
  updateUserList: (store, param) => {
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
            const payload = doc.data() || {};
            store.commit('USERS_UPDATED', snakeToCamelObject(payload));
          });
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default actions;
