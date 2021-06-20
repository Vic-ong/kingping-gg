<template>
  <div>
    <div :class="$vuetify.breakpoint.xs ? '' : 'page-bg-extension'" />
    <PageContainer>
      <div :class="$vuetify.breakpoint.xs ? '' : 'page-wrapper'">
        <!-- mobile view -->
        <v-row v-if="$vuetify.breakpoint.xs" no-gutters>
          <v-img :src="cardImage" />
          <v-col class="mt-5">
            <div v-if="!isLoggedIn || !userProfile.data" class="card-wrapper">
              <SignUpForm :formHeight="cardHeight" />
            </div>
            <div v-else class="card-wrapper center-items">
              <transition name="fade">
                <div v-if="userProfile.data && userProfile.data.firstName">
                  <p class="title-font" style="font-size: 36px;">Hello, {{ userProfile.data.firstName }}!</p>
                  <div>
                    <v-btn
                      @click="$router.push({ name: 'wager' })"
                      color="secondary"
                      class="mt-3"
                      style="min-width: 200px;"
                      tile
                      large
                    >
                      Place a Bet
                    </v-btn>
                  </div>
                  <div>
                    <v-btn
                      @click="$router.push({ name: 'instructions' })"
                      color="background"
                      class="mt-3 white--text"
                      style="min-width: 200px;"
                      tile
                      large
                    >
                      Instructions
                    </v-btn>
                  </div>
                </div>
              </transition>
            </div>
          </v-col>
        </v-row>

        <!-- non-mobile view -->
        <v-row v-else no-gutters class="intro">
          <v-col cols="12" sm="6">
            <v-card class="card-image-wrapper transparent" tile flat>
              <div class="image-wrapper elevation-7">
                <v-img class="white--text align-end card-image" :height="cardHeight" :src="cardImage">
                  <v-card-title class="tagline-1 title-font"> Get Paid Playing </v-card-title>
                  <v-card-title class="tagline-2 title-font"> Warzone </v-card-title>
                </v-img>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card v-if="!isLoggedIn || !userProfile.data" class="card-wrapper transparent" tile flat>
              <SignUpForm :formHeight="cardHeight" />
            </v-card>
            <v-card v-else class="card-wrapper center-items elevation-7" :height="cardHeight" tile>
              <transition name="fade">
                <div v-if="userProfile.data && userProfile.data.firstName">
                  <p class="title-font" style="font-size: 36px;">Hello, {{ userProfile.data.firstName }}!</p>
                  <v-btn @click="$router.push({ name: 'wager' })" color="secondary" class="mt-3" tile large>
                    Place a Bet
                  </v-btn>
                  <v-btn
                    @click="$router.push({ name: 'instructions' })"
                    color="background"
                    class="mt-3 ml-3 white--text"
                    tile
                    large
                  >
                    Instructions
                  </v-btn>
                </div>
              </transition>
            </v-card>
          </v-col>
        </v-row>

        <UserWagers v-if="isLoggedIn && userProfile.data" :userId="userProfile.data._id" />
      </div>
    </PageContainer>
  </div>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { UserState } from '@/store/profile/types';
import PageContainer from '@/components/layouts/PageContainer.vue';
import SignUpForm from '@/components/SignUpForm.vue';
import UserWagers from '@/components/Overview/UserWagers.vue';
import cardImage from '@/assets/images/warzone_profile.jpg';

const profile = namespace('profile');

@Component({
  name: 'Home',
  components: {
    PageContainer,
    SignUpForm,
    UserWagers,
  },
})
export default class Home extends Vue {
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
    });
  }

  @profile.Getter
  public userProfile!: UserState;

  private isLoggedIn = false;
  private cardHeight = '660px';
  private cardImage = cardImage;
  private getStarted = [
    'Sign up using your Activision ID',
    'Place a wager on your desired game mode',
    'Win and get paid!',
  ];
}
</script>

<style lang="scss" scoped>
.page-bg-extension {
  height: 120px;
  background-color: var(--v-background-base);
}
.page-wrapper {
  margin-top: -90px;
}

.card-wrapper {
  padding: 0 30px 20px 30px;
}
.card-image-wrapper {
  padding: 0 30px 20px 0;
}

.image-wrapper {
  overflow: hidden;
  .card-image {
    transition: transform 0.3s;
  }
  .tagline-1 {
    font-size: 45px;
    text-align: left;
    transition: all 0.3s ease-in-out;
  }
  .tagline-2 {
    font-size: 84px;
    margin-bottom: 10px;
    transition: all 0.3s ease-in-out;
  }
  .card-image:hover {
    transform: scale(1.1);
  }
  .card-image:hover .tagline-1 {
    font-size: 36px;
    margin-left: 20px;
  }
  .card-image:hover .tagline-2 {
    font-size: 90px;
    color: var(--v-secondary-base);
    margin-bottom: 40px;
    margin-left: 20px;
  }
}

.center-items {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
