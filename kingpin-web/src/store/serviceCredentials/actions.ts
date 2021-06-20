import { ActionTree } from 'vuex';
import db from '@/store/firestore';
import { camelToSnakeObject, snakeToCamelObject } from '@/utils/formats';
import { RootState } from '@/store/types';
import { ServiceCredentialsState, Credential } from './types';

const COLLECTION = 'service_credentials';
const docRef = db.collection(COLLECTION);

const actions: ActionTree<ServiceCredentialsState, RootState> = {
  getServiceCredentials: async (store) => {
    try {
      store.commit('SET_LOADING');
      const snapshot = await docRef.get();
      if (snapshot.empty) {
        store.commit('SET_ERROR');
        console.error('No matching documents.');
        return;
      }
      const payload: Credential[] = [];
      snapshot.forEach((doc) => {
        const data = snakeToCamelObject(doc.data()) as Credential;
        if (data)
          payload.push({
            ...data,
            _id: doc.id,
          });
      });
      store.commit('SET_LOADED', payload);
    } catch (err) {
      store.commit('SET_ERROR');
      throw err;
    }
  },
  createServiceCredential: (store, param) => {
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
  updateServiceCredentials: (store, param) => {
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
            const data = doc.data() as Credential;
            const payload = {
              ...data,
              _id: doc.id,
            };
            store.commit('SET_UPDATED', snakeToCamelObject(payload));
          });
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default actions;
