import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { WagerStates } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  wager: baseState,
  userWagers: baseState,
  wagerList: baseState,
};

const profile: Module<WagerStates, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default profile;
