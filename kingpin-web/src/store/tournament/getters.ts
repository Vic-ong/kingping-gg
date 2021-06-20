import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { TournamentStates, TournamentState, TournamentListState } from './types';

const getters: GetterTree<TournamentStates, RootState> = {
  tournament(state): TournamentState {
    return state.tournament;
  },
  tournamentList(state): TournamentListState {
    return state.tournamentList;
  },
};

export default getters;
