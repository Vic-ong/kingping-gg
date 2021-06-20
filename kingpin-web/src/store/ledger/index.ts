import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { LedgerState } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  transactions: baseState,
};

const ledger: Module<LedgerState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default ledger;
