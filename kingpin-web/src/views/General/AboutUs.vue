<template>
  <div>
    <div class="mt-7 title-font font-xl">
      {{ title }}
    </div>
    <div class="d-flex justify-center align-center">
      <div class="mt-7" style="max-width: 40rem; text-align: left;">
        <div v-for="desc in descriptions" v-bind:key="desc" class="mb-7">
          {{ desc }}
        </div>
      </div>
    </div>

    <div class="my-3 title-font">
      <div>
        <router-link :to="{ name: 'instructions' }">
          Wager instructions
        </router-link>
      </div>
      <div class="mt-2">
        <router-link :to="{ name: 'faq' }">
          Frequently asked questions
        </router-link>
      </div>
      <div class="my-5">
        <v-btn @click="$router.push({ name: 'wager' })" color="secondary" tile large>
          Lets wager!
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      title: 'About Us',
      descriptions: [
        'Kingpin is a platform that specializes in Warzon skill-based betting. You place wagers on challenges such as placing in top 5 or getting a certain number of kills, and you get paid out if the requirements are met.',
        'We want to bring the intensity of playing Warzone to the next level by creating personalized challenges that not only improves your gaming experience, but also lets you earn money.',
        'You can team up with other people, either using Kingpin or on your own, to double the fun! Based on the your history of playing Warzone, we provide 3-5 betting options that would match your level of expertise.',
      ],
    };
  },
};
</script>
