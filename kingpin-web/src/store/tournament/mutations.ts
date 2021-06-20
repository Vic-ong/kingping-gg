import { MutationTree } from 'vuex';
import { errorState, loadingState } from '@/store/constants';
import { TournamentStates, Tournament } from './types';

const mutations: MutationTree<TournamentStates> = {
  // tournament
  TOURNAMENT_ERROR(state) {
    state.tournament = errorState;
  },
  TOURNAMENT_LOADING(state) {
    state.tournament = loadingState;
  },
  TOURNAMENT_LOADED(state, payload: Tournament) {
    state.tournament = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  TOURNAMENT_UPDATED(state, payload) {
    state.tournament = {
      loading: false,
      error: false,
      data: {
        ...state.tournament.data,
        ...payload,
      },
    };
  },
  // tournamentList
  TOURNAMENTS_ERROR(state) {
    state.tournamentList = errorState;
  },
  TOURNAMENTS_LOADING(state) {
    state.tournamentList = loadingState;
  },
  TOURNAMENTS_LOADED(state, payload: Tournament[]) {
    state.tournamentList = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  TOURNAMENTS_UPDATED(state, payload) {
    if (state.tournamentList.data) {
      state.tournamentList.data = state.tournamentList.data.map((tournament) => {
        if (tournament._id === payload._id) {
          return payload;
        }
        return tournament;
      });
    }
  },
};

export default mutations;
