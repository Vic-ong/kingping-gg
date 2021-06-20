import { MutationTree } from 'vuex';
import { ProfileState, User } from './types';

const mutations: MutationTree<ProfileState> = {
  PROFILE_LOADED(state, payload: User) {
    state.user = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  PROFILE_UPDATED(state, payload) {
    state.user.data = {
      ...state.user.data,
      ...payload,
    };
  },
  PROFILE_LOADING(state) {
    state.user = {
      loading: true,
      error: false,
    };
  },
  PROFILE_ERROR(state) {
    state.user = {
      loading: false,
      error: true,
    };
  },
  USERS_LOADED(state, payload: User[]) {
    state.userList = {
      loading: false,
      error: false,
      data: payload,
    };
  },
  USERS_UPDATED(state, payload) {
    if (state.userList.data) {
      state.userList.data = state.userList.data.map((user) => {
        if (user._id === payload._id) {
          return payload;
        }
        return user;
      });
    }
  },
  USERS_LOADING(state) {
    state.userList = {
      loading: true,
      error: false,
    };
  },
  USERS_ERROR(state) {
    state.userList = {
      loading: false,
      error: true,
    };
  },
};

export default mutations;
