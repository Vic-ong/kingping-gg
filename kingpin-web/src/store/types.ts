export interface RootState {
  version: string;
}

export interface DateTime {
  nanoseconds: number;
  seconds: number;
  [key: string]: number;
}

export interface CurrencyProps {
  currency: string;
  dollars: number;
  cents: number;
  [key: string]: string | number;
}
