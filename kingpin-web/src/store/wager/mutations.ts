import { MutationTree } from 'vuex';
import { errorState, loadingState } from '@/store/constants';
import { WagerStates, Wager } from './types';

const mutations: MutationTree<WagerStates> = {
  // wager
  WAGER_ERROR(state) {
    state.wager = errorState;
  },
  WAGER_LOADING(state) {
    state.wager = loadingState;
  },
  WAGER_LOADED(state, payload: Wager) {
    state.wager = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  WAGER_UPDATED(state, payload) {
    state.wager = {
      loading: false,
      error: false,
      data: {
        ...state.wager.data,
        ...payload,
      },
    };
  },
  // userWagers
  USER_WAGERS_ERROR(state) {
    state.userWagers = errorState;
  },
  USER_WAGERS_LOADING(state) {
    state.userWagers = loadingState;
  },
  USER_WAGERS_LOADED(state, payload: Wager[]) {
    state.userWagers = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  // wagerList
  WAGERS_ERROR(state) {
    state.wagerList = errorState;
  },
  WAGERS_LOADING(state) {
    state.wagerList = loadingState;
  },
  WAGERS_LOADED(state, payload: Wager[]) {
    state.wagerList = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  WAGERS_UPDATED(state, payload) {
    if (state.wagerList.data) {
      state.wagerList.data = state.wagerList.data.map((wager) => {
        if (wager._id === payload._id) {
          return payload;
        }
        return wager;
      });
    }
  },
};

export default mutations;
