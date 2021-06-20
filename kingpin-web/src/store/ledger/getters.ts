import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { LedgerState, TransactionsState } from './types';

const getters: GetterTree<LedgerState, RootState> = {
  transactions(state): TransactionsState {
    return state.transactions;
  },
};

export default getters;
