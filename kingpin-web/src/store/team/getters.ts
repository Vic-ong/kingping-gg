import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { TeamState, TeamDataState, TeamsDataState } from './types';

const getters: GetterTree<TeamState, RootState> = {
  team(state): TeamDataState {
    return state.team;
  },
  teams(state): TeamsDataState {
    return state.teams;
  },
};

export default getters;
