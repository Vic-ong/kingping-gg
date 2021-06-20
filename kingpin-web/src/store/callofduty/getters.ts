import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { OddsState, CallOfDutyState } from './types';

const getters: GetterTree<CallOfDutyState, RootState> = {
  odds(state): OddsState {
    return state.odds;
  },
};

export default getters;
