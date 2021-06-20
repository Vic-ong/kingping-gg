import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { ProfileState, UserListState, UserState } from './types';

const getters: GetterTree<ProfileState, RootState> = {
  userProfile(state): UserState {
    return state.user;
  },
  userList(state): UserListState {
    return state.userList;
  },
};

export default getters;
