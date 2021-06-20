import { MutationTree } from 'vuex';
import { Odds, CallOfDutyState } from './types';

const mutations: MutationTree<CallOfDutyState> = {
  SET_LOADING(state) {
    state.odds = {
      loading: true,
      error: false,
    };
  },
  SET_ERROR(state) {
    state.odds = {
      loading: false,
      error: true,
    };
  },
  ODDS_LOADED(state, payload: Odds[]) {
    state.odds = {
      loading: false,
      error: false,
      data: payload,
    };
  },
};

export default mutations;
