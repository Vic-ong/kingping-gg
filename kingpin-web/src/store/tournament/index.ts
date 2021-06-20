import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { TournamentStates } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  tournament: baseState,
  tournamentList: baseState,
};

const profile: Module<TournamentStates, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default profile;
