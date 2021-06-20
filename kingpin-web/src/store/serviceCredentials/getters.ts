import { GetterTree } from 'vuex';
import { RootState } from '@/store/types';
import { ServiceCredentialsState, CredentialsState } from './types';

const getters: GetterTree<ServiceCredentialsState, RootState> = {
  credentials(state): CredentialsState {
    return state.credentials;
  },
};

export default getters;
