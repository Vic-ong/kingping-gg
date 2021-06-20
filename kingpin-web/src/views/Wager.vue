<template>
  <PageContainer>
    <v-card v-if="userWagers.loading" tile flat class="status-container transparent">
      <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
      <div class="title-font">{{ loadingMsg }}</div>
    </v-card>

    <div v-else-if="allowWager" class="stepper-container" v-bind:style="stepperContainerStyles">
      <v-stepper v-model="currentStep" :class="isXS ? 'elevation-0' : 'elevation-7'" v-bind:style="stepperWidth">
        <v-stepper-header v-if="!isXS" class="elevation-4 surface">
          <div v-for="(step, i) in steps" v-bind:key="i">
            <v-stepper-step
              complete-icon=""
              :complete="currentStep > i + 1"
              :color="currentStep > i + 1 ? 'secondary' : 'primary'"
              :step="i + 1"
            >
              {{ step }}
            </v-stepper-step>
          </div>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <GameMode v-if="currentStep === 1" v-bind:style="contentStyles" @next="handleNext" />
          </v-stepper-content>

          <v-stepper-content step="2">
            <TeamSelection v-if="currentStep === 2" v-bind:style="contentStyles" :params="params" @next="handleNext" />
          </v-stepper-content>

          <v-stepper-content step="3">
            <WagerSelection v-if="currentStep === 3" v-bind:style="contentStyles" :params="params" @next="handleNext" />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>

    <div v-else>
      <v-card tile flat class="status-container transparent">
        <v-icon class="ma-3" color="info" x-large>fa-clock</v-icon>
        <div class="title-font">You cannot place more than one bet within 5 minutes</div>
        <div class="title-font">{{ timeElapsed }}</div>
      </v-card>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { WagerListState } from '@/store/wager/types';
import PageContainer from '@/components/layouts/PageContainer.vue';
import GameMode from '@/components/Wager/GameMode.vue';
import TeamSelection from '@/components/Wager/TeamSelection.vue';
import WagerSelection from '@/components/Wager/WagerSelection.vue';

const wager = namespace('wager');

interface GetWagerParamsProps {
  userId: string;
  limit: number;
}

interface ParamsProps {
  mode: string;
  partyIds: string[];
  [key: string]: string | string[];
}

interface StepperProps {
  param: string;
  value: string;
  type: string;
  skip?: number;
}

@Component({
  name: 'Wager',
  components: {
    PageContainer,
    GameMode,
    TeamSelection,
    WagerSelection,
  },
})
export default class Wager extends Vue {
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.getWagersByUser({
          userId: user.uid,
          limit: 1,
        });
      }
    });
  }

  @wager.Action
  public getWagersByUser!: (params: GetWagerParamsProps) => void;

  @wager.Getter
  public userWagers!: WagerListState;

  private loadingMsg = 'Loading...';
  private currentStep = 1;
  private steps = ['Modes', 'Team', 'Wager'];
  private params: ParamsProps = {
    mode: '',
    partyIds: [],
  };

  get isXS() {
    return this.$vuetify.breakpoint.xs;
  }

  get stepperContainerStyles() {
    return {
      alignItems: this.isXS ? 'none' : 'center',
      minHeight: `calc(100vh - ${this.isXS ? 56 : 112}px)`,
    };
  }

  get stepperWidth() {
    return {
      minWidth: this.isXS ? '100vw' : '700px',
    };
  }

  get contentStyles() {
    return {
      display: 'flex',
      justifyContent: 'center',
      alignItems: this.isXS ? 'none' : 'center',
      padding: this.isXS ? '0' : '48px',
    };
  }

  get timeElapsed() {
    if (this.userWagers.data && this.userWagers.data.length > 0) {
      const { createdAt } = this.userWagers.data[0];
      const currentTime = new Date().getTime() / 1000;
      const t = Math.round((5 * 60 - (currentTime - createdAt.seconds)) / 60);

      if (t < 1) return 'Less than a minute left...';
      if (t === 1) return '1 minute left';
      return `${t} minutes left`;
    }
    return '-';
  }

  get allowWager() {
    if (this.userWagers.loading) return false;

    if (this.userWagers.data) {
      if (this.userWagers.data.length === 0) {
        return true;
      }
      const { createdAt } = this.userWagers.data[0];
      const currentTime = new Date().getTime() / 1000;
      return currentTime - createdAt.seconds > 5 * 60;
    }
    return false;
  }

  public handleNext({ param, value, skip }: StepperProps) {
    this.params[param] = value;
    if (this.currentStep < 3) this.currentStep += skip || 1;
  }
}
</script>

<style lang="scss" scoped>
.stepper-container {
  padding: 36px 0;
  display: flex;
  justify-content: center;
}
.status-container {
  height: 100vh;
  padding-top: 10%;
}
</style>
