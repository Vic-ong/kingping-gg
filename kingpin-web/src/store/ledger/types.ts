import { DateTime, CurrencyProps } from '@/store/types';

export interface UserTransaction {
  _id: string;
  firstName: string;
  lastName: string;
  previousBalance: CurrencyProps;
  currentBalance: CurrencyProps;
}

export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  user: UserTransaction;
  createdAt: DateTime;
  updatedAt: DateTime;
  [key: string]: string | number | UserTransaction | DateTime;
}

export interface NewTransactionProps {
  amount: number;
  description: string;
  user: UserTransaction;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionsState {
  loading: boolean;
  error: boolean;
  data?: Transaction[];
  [key: number]: Transaction;
}

export interface LedgerState {
  transactions: TransactionsState;
}
