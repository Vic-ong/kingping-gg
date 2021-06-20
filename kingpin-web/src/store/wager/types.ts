import { DateTime } from '@/store/types';

export interface Wager {
  _id: string;
  wagerId: string;
  partyIds: string[];
  mode: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    activisionId: string;
  };
  bettingOdds: {
    _id: string;
    name: string;
    multiplier: number;
  };
  amount: number;
  payout: number;
  status: string;
  match_id?: string;
  outcome: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface WagerState {
  loading: boolean;
  error: boolean;
  data?: Wager;
}

export interface WagerListState {
  loading: boolean;
  error: boolean;
  data?: Wager[];
}

export interface WagerStates {
  wager: WagerState;
  userWagers: WagerListState;
  wagerList: WagerListState;
}
