<template>
  <v-app>
    <div id="app">
      <Header />
      <v-content id="router-content"><router-view /></v-content>
      <Footer />
    </div>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

@Component({
  name: 'App',
  components: {
    Header,
    Footer,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Passion+One&display=swap');

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  a {
    text-decoration: none;
    color: inherit;
  }

  .v-btn {
    font-family: 'Passion One', cursive, 'Roboto', sans-serif;
  }

  .v-icon {
    font-size: 20px;
  }

  .title-font {
    font-family: 'Passion One', cursive, 'Roboto', sans-serif;
    text-transform: uppercase;
  }
  .font-xl {
    font-size: 36px;
  }
  .font-l {
    font-size: 24px;
  }
  .font-m {
    font-size: 18px;
  }
  .font-s {
    font-size: 14px;
  }
  .font-xs {
    font-size: 12px;
  }
}
</style>
