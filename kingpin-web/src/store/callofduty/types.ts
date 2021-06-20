export interface Odds {
  _id: string;
  name: string;
  multiplier: number;
  criteria: object;
}

export interface OddsState {
  error: boolean;
  loading: boolean;
  data?: Odds[];
}

export interface CallOfDutyState {
  odds: OddsState;
}
