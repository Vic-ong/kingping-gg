import Vue from 'vue';
import firebase from '@/services/firebase';
import axios from 'axios';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.prototype.$axios = axios;
Vue.config.productionTip = false;

/* eslint-disable */
let app: Vue.CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

firebase.auth().onAuthStateChanged((user) => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: (h) => h(App),
    }).$mount('#app');
  }
});
