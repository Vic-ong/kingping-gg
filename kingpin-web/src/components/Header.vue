<template>
  <div>
    <!-- mobile view -->
    <div v-if="$vuetify.breakpoint.xs">
      <v-app-bar color="background" dark flat>
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <!-- balance -->
        <div v-if="isLoggedIn">
          <v-tooltip v-model="balanceTooltip" bottom>
            <template v-slot:activator="{ attrs }">
              <v-btn
                @click="balanceTooltip = !balanceTooltip"
                v-bind="attrs"
                tile
                class="white title-font ml-2 mr-2 black--text"
              >
                Balance: $ {{ balanceDisplay }}
              </v-btn>
            </template>
            <div class="tooltip">
              <div class="title-font tooltip-title">To deposit funds:</div>
              <div class="mb-5">
                <router-link v-if="isLoggedIn" :to="{ name: 'deposit' }">
                  <v-btn class="primary" tile large>
                    <v-icon class="mr-3">fa-money-bill-alt</v-icon>
                    Deposit
                  </v-btn>
                </router-link>
                <div class="tooltip-content mt-2">
                  To claim your promotion(s), please contact us on
                  <a class="link secondary--text" :href="paymentContact.discordValue" target="_blank">
                    {{ paymentContact.discordText }}
                  </a>
                </div>
              </div>
              <div class="title-font tooltip-title">To withdraw funds:</div>
              <div class="tooltip-content">
                Please email
                <a class="link secondary--text" :href="paymentContact.emailValue">{{ paymentContact.emailText }}</a> or
                join
                <a class="link secondary--text" :href="paymentContact.discordValue" target="_blank">
                  {{ paymentContact.discordText }}
                </a>
                for fund withdrawal
              </div>
            </div>
          </v-tooltip>
        </div>
        <router-link v-if="route !== 'login' && !isLoggedIn" to="/login">
          <v-btn tile class="white title-font ml-2 mr-2 black--text"> Log In </v-btn>
        </router-link>
        <router-link v-if="route === 'login' && !isLoggedIn" to="/">
          <v-btn tile class="white title-font ml-2 mr-2 black--text"> Sign Up </v-btn>
        </router-link>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" absolute temporary dark>
        <div class="mobile-logo-container">
          <router-link to="/">
            <v-img style="margin-right: 6px;" :src="appLogo" aspect-ratio="1" width="36px"></v-img>
          </router-link>
          <router-link to="/">
            <span class="title-font logo-title white--text">kingpin</span>
            <span class="title-font logo-title secondary--text">.gg</span>
          </router-link>
        </div>
        <v-list dense>
          <v-list-item to="/">
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item to="/instructions">
            <v-list-item-title>Instructions</v-list-item-title>
          </v-list-item>

          <v-list-item to="/faq">
            <v-list-item-title>FAQ</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="isLoggedIn" to="/wager">
            <v-list-item-title>Place a Bet</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="isLoggedIn" :to="profileRoute()">
            <v-list-item-title>Profile ({{ userProfile.data && userProfile.data.firstName }})</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="isLoggedIn" @click="signOutHandler">
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </div>

    <!-- non-mobile view -->
    <div v-else>
      <v-app-bar color="background" class="pt-5 pl-2 pr-2" extended flat>
        <router-link to="/">
          <v-img style="margin-right: 6px;" :src="appLogo" aspect-ratio="1" width="36px"></v-img>
        </router-link>
        <router-link to="/">
          <span class="title-font logo-title white--text">kingpin</span>
          <span class="title-font logo-title secondary--text">.gg</span>
        </router-link>

        <v-spacer></v-spacer>

        <router-link v-if="!isLoggedIn" to="/#about">
          <v-btn v-if="route === 'home'" tile x-large class="white title-font ml-2 mr-2"> About </v-btn>
        </router-link>
        <!-- balance -->
        <div v-if="isLoggedIn">
          <v-tooltip v-model="balanceTooltip" bottom>
            <template v-slot:activator="{ attrs }">
              <v-btn
                @click="balanceTooltip = !balanceTooltip"
                v-bind="attrs"
                tile
                x-large
                class="white title-font ml-2 mr-2"
              >
                $ {{ balanceDisplay }}
              </v-btn>
            </template>
            <div class="tooltip">
              <div class="title-font tooltip-title">To deposit funds:</div>
              <div class="mb-5">
                <router-link v-if="isLoggedIn" :to="{ name: 'deposit' }">
                  <v-btn class="primary" tile large>
                    <v-icon class="mr-3">fa-money-bill-alt</v-icon>
                    Deposit
                  </v-btn>
                </router-link>
                <div class="tooltip-content mt-2">
                  To claim your promotion(s), please contact us on
                  <a class="link secondary--text" :href="paymentContact.discordValue" target="_blank">
                    {{ paymentContact.discordText }}
                  </a>
                </div>
              </div>
              <div class="title-font tooltip-title">To withdraw funds:</div>
              <div class="tooltip-content">
                Please email
                <a class="link secondary--text" :href="paymentContact.emailValue">{{ paymentContact.emailText }}</a> or
                join
                <a class="link secondary--text" :href="paymentContact.discordValue" target="_blank">
                  {{ paymentContact.discordText }}
                </a>
                for fund withdrawal
              </div>
            </div>
          </v-tooltip>
        </div>
        <router-link v-if="isLoggedIn" :to="profileRoute()">
          <v-btn tile x-large class="white title-font ml-2 mr-2">
            {{ userProfile.data && userProfile.data.firstName }}
          </v-btn>
        </router-link>
        <router-link v-if="route !== 'login' && !isLoggedIn" to="/login">
          <v-btn tile x-large class="primary title-font ml-2 mr-2"> Log In </v-btn>
        </router-link>
        <router-link v-if="route === 'login' && !isLoggedIn" to="/">
          <v-btn tile x-large class="primary title-font ml-2 mr-2"> Sign Up </v-btn>
        </router-link>
        <router-link v-if="route !== 'home' && route !== 'wager' && isLoggedIn" to="/wager">
          <v-btn tile x-large class="primary title-font ml-2 mr-2"> Place a Bet </v-btn>
        </router-link>
        <router-link v-if="route !== 'myprofile' && route !== 'home' && route !== 'instructions'" to="/instructions">
          <v-btn tile x-large class="primary title-font ml-2 mr-2"> Instructions </v-btn>
        </router-link>
        <router-link v-if="route !== 'myprofile' && route !== 'faq'" to="/faq">
          <v-btn tile x-large class="primary title-font ml-2 mr-2"> FAQ </v-btn>
        </router-link>
        <v-btn v-if="isLoggedIn" @click="signOutHandler" tile x-large class="primary title-font ml-2 mr-2">
          Log Out
        </v-btn>
      </v-app-bar>
    </div>

    <v-dialog v-model="platformDialog" max-width="500" persistent>
      <PlaformIdForm :data="userProfile.data"></PlaformIdForm>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { UserState } from '@/store/profile/types';
import Currency from '@/utils/currency';
import appLogo from '@/assets/logo/app_logo.png';
import PlaformIdForm from './PlatformIdForm.vue';

const profile = namespace('profile');

@Component({
  name: 'mainHeader',
  components: {
    PlaformIdForm,
  },
})
export default class Header extends Vue {
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn && user) {
        this.getUser(user.uid);
      }
    });
  }

  @Watch('route')
  nameChanged() {
    this.balanceTooltip = false;
  }

  @profile.Action
  public getUser!: (authId: string) => void;

  @profile.Getter
  public userProfile!: UserState;

  private appLogo = appLogo;
  private drawer = false;
  private isLoggedIn = false;
  private balanceTooltip = false;
  private paymentContact = {
    emailText: 'payments@kingpin.gg',
    emailValue: 'mailto:payments@kingpin.gg?subject=Deposit/Withdraw Fund',
    discordText: 'our discord',
    discordValue: 'https://discord.gg/S2XAfJj',
  };

  get route(): string | null | undefined {
    return this.$route.name;
  }
  get balanceDisplay() {
    if (this.userProfile.data) {
      return new Currency(this.userProfile.data.currentBalance).objToCurrencyNum();
    }
    return '-';
  }
  get isLoading() {
    return this.userProfile.loading;
  }
  get isError() {
    return this.userProfile.error;
  }
  get platformId() {
    return this._.get(this.userProfile, 'data.platformId');
  }
  get platformDialog() {
    if (this.isLoading || !this.userProfile.data || this.platformId) return false;
    return true;
  }

  public profileRoute() {
    if (this.userProfile.data) {
      return '/myprofile';
    }
    return '/';
  }

  public async signOutHandler(): Promise<void> {
    try {
      await this.signOut();
      this.$router.replace({ name: 'login' });
    } catch (err) {
      console.error(err);
    }
  }

  public signOut() {
    return firebase.auth().signOut();
  }
}
</script>

<style lang="scss" scoped>
.mobile-logo-container {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}
.logo-title {
  font-size: 24px;
}
.tooltip {
  padding: 12px;
  text-align: left;
  pointer-events: auto;

  .tooltip-title {
    font-size: 18px;
    padding-bottom: 10px;
  }

  .tooltip-content {
    a {
      font-weight: 600;
    }
  }
}
</style>
