import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from './types';
import profile from './profile';
import team from './team';
import wager from './wager';
import tournament from './tournament';
import callofduty from './callofduty';
import serviceCredentials from './serviceCredentials';
import ledger from './ledger';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0',
  },
  mutations: {},
  actions: {},
  modules: {
    profile,
    wager,
    team,
    tournament,
    callofduty,
    serviceCredentials,
    ledger,
  },
};

export default new Vuex.Store<RootState>(store);
