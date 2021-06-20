import * as firebase from 'firebase/app';
import 'firebase/auth';
import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import Redirect404 from '@/views/Redirect404.vue';
import Home from '@/views/Home.vue';

import AboutUs from '@/views/General/AboutUs.vue';
import PrivacyPolicy from '@/views/General/PrivacyPolicy.vue';
import TermsOfUse from '@/views/General/TermsOfUse.vue';
import Instructions from '@/views/Instructions.vue';
import FAQ from '@/views/FAQ.vue';

import Profile from '@/views/Account/Profile.vue';
import Wager from '@/views/Wager.vue';
import Tournaments from '@/views/Tournaments.vue';
import TournamentWager from '@/views/TournamentWager.vue';
import Deposit from '@/views/Account/Deposit.vue';
import Result from '@/views/Result.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/about-us',
    name: 'about-is',
    component: AboutUs,
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicy,
  },
  {
    path: '/terms-of-use',
    name: 'terms-of-use',
    component: TermsOfUse,
  },
  {
    path: '/instructions',
    name: 'instructions',
    component: Instructions,
  },
  {
    path: '/faq',
    name: 'faq',
    component: FAQ,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LogIn.vue'),
  },
  {
    path: '/admin/dashboard',
    name: 'adminDashboard',
    component: () => import('@/views/Admin/Dashboard.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/myprofile',
    name: 'myprofile',
    component: Profile,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/account/deposit',
    name: 'deposit',
    component: Deposit,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/wager',
    name: 'wager',
    component: Wager,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/tournaments',
    name: 'tournaments',
    component: Tournaments,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/tournaments/:id/wager',
    name: 'tournaments/:id/wager',
    component: TournamentWager,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/match_result/:id',
    name: 'result',
    component: Result,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '*',
    name: 'others',
    component: Redirect404,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      const selector = document.querySelector(to.hash) as HTMLDivElement;
      return window.scrollTo({
        top: selector.offsetTop,
        behavior: 'smooth',
      });
    }

    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth);
  const isAuthenticated = firebase.auth().currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
