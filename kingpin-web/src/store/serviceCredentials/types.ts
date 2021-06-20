import { DateTime } from '@/store/types';

export interface Credential {
  _id: string;
  active: boolean;
  group: string;
  email: string;
  password: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  [key: string]: string | boolean | DateTime;
}

export interface CredentialsState {
  loading: boolean;
  error: boolean;
  data?: Credential[];
  [key: number]: Credential;
}

export interface ServiceCredentialsState {
  credentials: CredentialsState;
}
