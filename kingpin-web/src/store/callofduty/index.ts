import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { CallOfDutyState } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  odds: baseState,
};

const profile: Module<CallOfDutyState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default profile;
