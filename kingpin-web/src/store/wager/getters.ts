import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { WagerStates, WagerState, WagerListState } from './types';

const getters: GetterTree<WagerStates, RootState> = {
  wagers(state): WagerState {
    return state.wager;
  },
  userWagers(state): WagerListState {
    return state.userWagers;
  },
  wagerList(state): WagerListState {
    return state.wagerList;
  },
};

export default getters;
