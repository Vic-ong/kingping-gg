import { MutationTree } from 'vuex';
import { errorState, loadingState } from '@/store/constants';
import { TeamState, TeamData, Team } from './types';

const mutations: MutationTree<TeamState> = {
  SET_ERROR(state) {
    state.teams = errorState;
  },
  SET_LOADING(state) {
    state.teams = loadingState;
  },
  SET_LOADED(state, payload: Team[]) {
    state.teams = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  SET_ERROR_TEAM(state) {
    state.team = errorState;
  },
  SET_LOADING_TEAM(state) {
    state.team = loadingState;
  },
  SET_LOADED_TEAM(state, payload: TeamData) {
    state.team = {
      loading: false,
      error: false,
      data: payload,
    };
  },
};

export default mutations;
