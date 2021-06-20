import { ActionTree } from 'vuex';
import { RootState } from '@/store/types';
import { getBettingOdds } from '@/services/functions/callofduty';
import { snakeToCamelObject } from '@/utils/formats';
import { CallOfDutyState } from './types';

export interface GetOddsParamProps {
  userId: string;
  partyIds: string[];
  mode: string;
}

interface BettingOddProps {
  _id: string;
  name: string;
  multiplier: number;
  criteria: {
    kills: number;
    placement?: number;
  };
}

const actions: ActionTree<CallOfDutyState, RootState> = {
  getOdds: async (store, param) => {
    try {
      store.commit('SET_LOADING');
      const res = await getBettingOdds(param);
      const { result } = res.data;
      store.commit(
        'ODDS_LOADED',
        result.map((item: BettingOddProps) => snakeToCamelObject(item)),
      );
    } catch (err) {
      console.error(err);
      store.commit('SET_ERROR');
    }
  },
};

export default actions;
