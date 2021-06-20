import { MutationTree } from 'vuex';
import { errorState, loadingState } from '@/store/constants';
import { LedgerState, Transaction } from './types';

const mutations: MutationTree<LedgerState> = {
  SET_ERROR(state) {
    state.transactions = errorState;
  },
  SET_LOADING(state) {
    state.transactions = loadingState;
  },
  SET_LOADED(state, payload: Transaction[]) {
    state.transactions = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  SET_CREATED(state, payload: Transaction) {
    if (state.transactions.data) {
      state.transactions = {
        loading: false,
        error: false,
        data: [...state.transactions.data, payload],
      };
    } else {
      state.transactions = {
        loading: false,
        error: false,
        data: [payload],
      };
    }
  },
};

export default mutations;
