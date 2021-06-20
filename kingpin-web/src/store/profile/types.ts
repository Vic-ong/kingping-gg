import { DateTime, CurrencyProps } from '@/store/types';

export interface PlatformId {
  platform: string;
  username: string;
}
export interface User {
  _id: string;
  active: boolean;
  firstName: string;
  lastName: string;
  dob: string;
  state: string;
  email: string;
  activisionId: string;
  platformId: PlatformId;
  currentBalance: CurrencyProps;
  role: string;
  teamId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  [key: string]: string | boolean | PlatformId | CurrencyProps | DateTime;
}

export interface UserState {
  loading: boolean;
  error: boolean;
  data?: User;
}

export interface UserListState {
  loading: boolean;
  error: boolean;
  data?: User[];
  [key: number]: User;
}

export interface ProfileState {
  user: UserState;
  userList: UserListState;
}
