import { MutationTree } from 'vuex';
import { errorState, loadingState } from '@/store/constants';
import { ServiceCredentialsState, Credential } from './types';

const mutations: MutationTree<ServiceCredentialsState> = {
  SET_ERROR(state) {
    state.credentials = errorState;
  },
  SET_LOADING(state) {
    state.credentials = loadingState;
  },
  SET_LOADED(state, payload: Credential[]) {
    state.credentials = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  SET_CREATED(state, payload: Credential) {
    if (state.credentials.data) {
      state.credentials = {
        loading: false,
        error: false,
        data: [...state.credentials.data, payload],
      };
    } else {
      state.credentials = {
        loading: false,
        error: false,
        data: [payload],
      };
    }
  },
  SET_UPDATED(state, payload) {
    if (state.credentials.data) {
      state.credentials.data = state.credentials.data.map((item) => {
        if (item._id === payload._id) {
          return payload;
        }
        return item;
      });
    }
  },
};

export default mutations;
