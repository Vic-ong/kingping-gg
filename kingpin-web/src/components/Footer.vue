<template>
  <div class="background font-xs grey--text" :class="$vuetify.breakpoint.xs ? 'px-5' : 'px-10'">
    <v-row>
      <v-col cols="12" md="6">
        <div :class="$vuetify.breakpoint.smAndUp && 'text-left'">
          <div class="text--lighten-2 py-3">© 2021 Kingpin</div>

          <a class="mr-2" href="https://www.facebook.com/Kingpin-108966564305189" target="_blank">
            <v-icon color="grey">fab fa-facebook</v-icon>
          </a>

          <a href="https://discord.gg/tuKVZQtH" target="_blank">
            <v-icon color="grey">fab fa-discord</v-icon>
          </a>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <v-row justify-md="end" class="text-left">
          <v-col v-for="{ name, items } in items" v-bind:key="name" cols="6" md="4">
            <div class="title-font font-m text--lighten-2">{{ name }}</div>
            <div class="mt-3">
              <component
                v-for="item in items"
                v-bind:key="item.name"
                :is="item.component"
                :to="item.component === 'router-link' && item.href"
                :href="item.component === 'a' && item.href"
              >
                <div>{{ item.name }}</div>
              </component>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'mainFooter',
})
export default class SignUpForm extends Vue {
  private items = [
    {
      name: 'Learn More',
      items: [
        {
          component: 'router-link',
          name: 'About Us',
          href: '/about-us',
        },
        {
          component: 'router-link',
          name: 'How it works?',
          href: '/instructions',
        },
      ],
    },
    // {
    //   name: 'Company',
    //   items: [
    //     {
    //       component: 'router-link',
    //       name: 'Privacy Policy',
    //       href: '/privacy-policy',
    //     },
    //     {
    //       component: 'router-link',
    //       name: 'Terms Of Use',
    //       href: '/terms-of-use',
    //     },
    //   ],
    // },
    {
      name: 'Contact',
      items: [
        {
          component: 'a',
          name: 'Email Us',
          href: 'mailto:aashin@kingpin.gg',
        },
        {
          component: 'router-link',
          name: 'FAQ',
          href: '/faq',
        },
      ],
    },
  ];
}
</script>
