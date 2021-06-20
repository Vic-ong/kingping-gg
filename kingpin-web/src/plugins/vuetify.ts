import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/dist/vuetify.min.css';
import VueLodash from 'vue-lodash';
import get from 'lodash/get';

Vue.use(VueLodash, { lodash: { get } });
Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#04004D',
        secondary: '#00D385',
        accent: '#9D98EC',
        background: '#212121',
        surface: '#F5F9FA',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
});
