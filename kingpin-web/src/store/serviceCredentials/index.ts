import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { baseState } from '@/store/constants';
import { ServiceCredentialsState } from './types';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  credentials: baseState,
};

const serviceCredentials: Module<ServiceCredentialsState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};

export default serviceCredentials;
