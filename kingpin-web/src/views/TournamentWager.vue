<template>
  <PageContainer style="min-height: 100vh;">
    <v-card v-if="isLoading" class="buffer-container buffer-font" tile flat>
      <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
      <div class="title-font">Retrieving wager info...</div>
    </v-card>

    <v-card v-else-if="isError" class="buffer-container buffer-font" tile flat>
      <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
      <div class="title-font">Invalid Wager!</div>
      <div style="font-size: 14px;">
        Please contact our admin team on the
        <a href="https://discord.gg/S2XAfJj" target="_blank" class="secondary--text">discord channel</a>.
      </div>
    </v-card>

    <v-card v-else-if="!tournamentStarted" class="buffer-container" tile flat>
      <div class="title-font">This tournament hasn't started.</div>
    </v-card>

    <v-card v-else-if="tournamentEnded" class="buffer-container" tile flat>
      <div class="title-font">This tournament has ended.</div>
    </v-card>

    <v-card v-else-if="allowWager" tile flat>
      <div class="title-font mt-3" style="font-size: 32px;">{{ tournamentData.name }}</div>
      <div class="mt-7">
        <v-card class="pa-5">
          <v-row>
            <v-col cols="12" sm="6">
              <div class="d-flex title-font text-left" style="font-size: 18px;">
                {{ tournamentData.description }}
              </div>
              <div class="reg-text d-flex mt-5">
                <v-icon color="black" class="mr-3">fa-donate</v-icon>
                {{ minPayoutText(tournamentData) }}
              </div>
              <div class="reg-text d-flex mt-3">
                <v-icon color="black" class="mr-3">fa-hourglass-start</v-icon>
                {{ lengthText(tournamentData) }}
              </div>
              <div class="reg-text d-flex mt-3">
                <v-icon color="black" class="mr-3">fa-file-invoice-dollar</v-icon>
                {{ betAmountText(tournamentData) }}
              </div>
              <div class="reg-text d-flex mt-3">
                <v-icon color="black" class="mr-3">fa-clock</v-icon>
                {{ startTimeText(tournamentData) }}
              </div>
              <div class="reg-text d-flex mt-3">
                <v-icon color="black" class="mr-3">fa-clock</v-icon>
                {{ endTimeText(tournamentData) }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div v-if="userProfile.data">
                <TournamentWagerSelection
                  :key="!!userProfile.data"
                  :tournament="tournament.data"
                  :userProfile="userProfile.data"
                ></TournamentWagerSelection>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </v-card>

    <div v-else>
      <v-card flat tile class="buffer-container transparent">
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
import { UserState } from '@/store/profile/types';
import { WagerListState } from '@/store/wager/types';
import { TournamentState, Tournament } from '@/store/tournament/types';
import { formatTimestamp, hoursDifference } from '@/utils/datetime';
import PageContainer from '@/components/layouts/PageContainer.vue';
import TournamentWagerSelection from '@/components/Wager/TournamentWagerSelection.vue';

const profile = namespace('profile');
const tournament = namespace('tournament');
const wager = namespace('wager');

interface GetWagerParamsProps {
  userId: string;
  limit: number;
}

@Component({
  name: 'Tournaments',
  components: {
    PageContainer,
    TournamentWagerSelection,
  },
})
export default class Wager extends Vue {
  mounted() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.getTournament(this.$route.params.id);
        this.getWagersByUser({
          userId: user.uid,
          limit: 1,
        });
      }
    });
  }

  @tournament.Action
  public getTournament!: (id: string) => void;
  @wager.Action
  public getWagersByUser!: (params: GetWagerParamsProps) => void;

  @tournament.Getter
  public tournament!: TournamentState;
  @wager.Getter
  public userWagers!: WagerListState;
  @profile.Getter
  public userProfile!: UserState;

  private dateTimeFormat = 'MMM DD, h:mm A';

  get isLoading() {
    return this.tournament.loading || this.userProfile.loading || this.userWagers.loading;
  }
  get isError() {
    return this.tournament.error || this.userProfile.error || this.userWagers.error;
  }
  get tournamentData() {
    return this.tournament.data || {};
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get tournamentStarted() {
    if (this.tournament.data) {
      const currentTime = new Date().getTime() / 1000;
      return currentTime - this.tournament.data.startTime.seconds > 0;
    }
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get tournamentEnded() {
    if (this.tournament.data) {
      const currentTime = new Date().getTime() / 1000;
      return this.tournament.data.endTime.seconds - currentTime < 0;
    }
    return true;
  }
  get allowWager() {
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

  public minPayoutText(item: Tournament) {
    return `$${item.minPayout} Prize`;
  }
  public lengthText(item: Tournament) {
    const { startTime, endTime } = item;

    if (!startTime || !endTime) return '';
    const diff = hoursDifference(startTime, endTime);

    return `Challenge opens for ${diff} hours`;
  }
  public betAmountText(item: Tournament) {
    return `Bet Amount: $${item.amount}`;
  }
  public startTimeText(item: Tournament) {
    if (!item.startTime) return '';
    const date = formatTimestamp(item.startTime, this.dateTimeFormat);

    return `Starts on ${date}`;
  }
  public endTimeText(item: Tournament) {
    if (!item.endTime) return '';
    const date = formatTimestamp(item.endTime, this.dateTimeFormat);

    return `Ends on ${date}`;
  }
}
</script>

<style lang="scss" scoped>
.buffer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}
.buffer-font {
  font-size: 32px;
}
.reg-text {
  font-size: 14px;
}
</style>
