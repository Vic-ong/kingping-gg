import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { TeamState } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  team: baseState,
  teams: baseState,
};

const team: Module<TeamState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default team;
