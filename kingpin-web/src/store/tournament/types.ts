import { DateTime } from '@/store/types';

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  betId: string;
  amount: number;
  minPayout: string;
  startTime: DateTime;
  endTime: DateTime;
  status: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface TournamentState {
  loading: boolean;
  error: boolean;
  data?: Tournament;
}

export interface TournamentListState {
  loading: boolean;
  error: boolean;
  data?: Tournament[];
}

export interface TournamentStates {
  tournament: TournamentState;
  tournamentList: TournamentListState;
}
