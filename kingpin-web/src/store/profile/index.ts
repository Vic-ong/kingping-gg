import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { ProfileState } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  user: baseState,
  userList: baseState,
};

const profile: Module<ProfileState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default profile;
