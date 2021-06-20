<template>
  <PageContainer>
    <div class="page">
      <v-card v-if="displayContent === 'content'" class="card-wrapper transparent" tile flat>
        <div class="title-container">
          <div class="title-font result-title">Proceed to start your match within</div>
          <div v-if="wagers.data.outcome === 'pending' || !passedMinTime" class="title-font timer-title info--text">
            <v-icon class="mr-3" color="info">far fa-clock</v-icon>
            <Timer v-if="timer" :timer="timer" />
            <span v-else>Passed 5 minutes</span>
          </div>
          <div v-if="wagers.data.outcome === 'pending'" class="mb-5 caption">
            Note: If game is not started within 5 mins, your bet will be refunded to you in an hour
          </div>
          <div class="wager-container">
            <v-card class="wager-content">
              <div class="title-font wager-title">Wager Info</div>
              <div><b>Bet On:</b> {{ wagers.data.bettingOdds.name }}</div>
              <div><b>Amount:</b> $ {{ wagers.data.amount }}</div>
              <div><b>Payout:</b> $ {{ wagers.data.payout }}</div>
              <div><b>Date:</b> {{ new Date(wagers.data.createdAt.seconds * 1000) }}</div>
            </v-card>
            <v-card class="wager-content">
              <div class="title-font wager-title">Match Info</div>
              <div><b>Party:</b> {{ wagers.data.partyIds.join(', ') }}</div>
              <div v-if="wagers.data.status"><b>Status:</b> {{ wagers.data.status }}</div>
              <div v-if="wagers.data.outcome"><b>Outcome:</b> {{ wagers.data.outcome }}</div>
            </v-card>
          </div>
        </div>
        <div class="actions-container">
          <v-btn v-if="passedMinTime" @click="placeNewBet" color="secondary" class="main-btn" tile large>
            Place another bet
          </v-btn>
          <v-btn v-if="!gaveUpBet" @click="showConfirm = true" color="error" class="main-btn" tile large>
            Concede Defeat
          </v-btn>
        </div>
        <p v-if="!gaveUpBet && !wagers.data.outcome" class="grey--text text--darken-1 reminder-text">{{ reminder }}</p>

        <v-dialog v-model="showConfirm" max-width="300">
          <v-card class="confirm-defeat-popup">
            <div class="title-font popup-title">Concede Defeat?</div>
            <p>You will lose the bet <i>regardless</i> of the match outcome.</p>
            <v-btn :loading="loading" @click="concedeDefeat" color="error" class="main-btn popup-btn" tile large>
              Confirm
            </v-btn>
          </v-card>
        </v-dialog>
      </v-card>

      <v-card v-if="displayContent === 'loading'" class="card-wrapper transparent" tile flat>
        <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
        <div class="title-container">
          <div class="title-font result-title">Retrieving wager info...</div>
        </div>
      </v-card>

      <v-card v-if="displayContent === 'error'" class="card-wrapper transparent" tile flat>
        <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
        <div class="title-container">
          <div class="title-font result-title">Invalid Wager!</div>
          <div class="title-font result-title">You may have entered the wrong link</div>
        </div>
      </v-card>

      <v-card v-if="displayContent === 'noAccess'" class="card-wrapper transparent" tile flat>
        <v-icon class="ma-3" color="info" x-large>fa-lock</v-icon>
        <div class="title-container">
          <div class="title-font result-title">No Permission!</div>
          <div class="title-font result-title">You do not have access to this page</div>
        </div>
      </v-card>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { WagerState } from '@/store/wager/types';
import { UserState } from '@/store/profile/types';
import PageContainer from '@/components/layouts/PageContainer.vue';
import Timer from '@/components/Timer.vue';

const wager = namespace('wager');
const profile = namespace('profile');

interface UpdateUserProps {
  id: string;
  status: string;
  updatedAt: Date;
}

@Component({
  name: 'Result',
  components: {
    PageContainer,
    Timer,
  },
})
export default class Result extends Vue {
  @Prop() id!: string;

  mounted() {
    if (this.id) {
      this.getWager(this.id);
    }
  }

  @wager.Getter
  public wagers!: WagerState;

  @profile.Getter
  public userProfile!: UserState;

  @wager.Action
  public getWager!: (wagerId: string) => void;

  @wager.Action
  public updateWager!: (param: UpdateUserProps) => void;

  private showConfirm = false;
  private loading = false;

  get displayContent(): string {
    if (this.wagers.loading || this.userProfile.loading) {
      return 'loading';
    }
    if (this.wagers.error || this.userProfile.error) {
      return 'error';
    }
    const hasAccess =
      this.wagers.data &&
      this.userProfile.data &&
      (this.wagers.data.user._id === this.userProfile.data._id || this.userProfile.data.role === 'admin');
    if (hasAccess) {
      return 'content';
    }
    return 'noAccess';
  }

  get passedMinTime(): boolean {
    if (!this.wagers.data) return false;
    const currentTime = new Date().getTime() / 1000;
    return currentTime - this.wagers.data.createdAt.seconds > 5 * 60;
  }

  get timer() {
    if (this.wagers.data && !this.passedMinTime) {
      const currentTime = new Date().getTime() / 1000;
      return 5 * 60 - Math.round(currentTime - this.wagers.data.createdAt.seconds);
    }
    return false;
  }

  get gaveUpBet(): boolean {
    if (!this.wagers.data) return false;
    return this.wagers.data.status === 'user_concede_defeat';
  }

  public placeNewBet() {
    this.$router.push({ name: 'wager' });
  }

  public async concedeDefeat() {
    this.loading = true;
    await this.updateWager({
      id: this.id,
      status: 'user_concede_defeat',
      updatedAt: new Date(),
    });
    this.showConfirm = false;
    this.$router.push({ name: 'home' });
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;

  .card-wrapper {
    flex: 1;

    .title-container {
      margin: 0 0 30px 0;

      .result-title {
        font-size: 32px;
      }

      .timer-title {
        font-size: 24px;
      }

      .wager-container {
        display: flex;
        justify-content: center;
        margin-top: 24px;

        & > :first-child {
          margin-right: 12px;
        }

        .wager-title {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .wager-content {
          width: 300px;
          padding: 12px 24px;
          text-align: left;
        }
      }
    }

    .actions-container {
      display: inline-flex;
      flex-direction: column;
      & > :not(:last-child) {
        margin-bottom: 12px;
      }
    }

    .reminder-text {
      width: 450px;
      text-align: left;
      margin: 30px auto 0 auto;
    }
  }
}

.confirm-defeat-popup {
  padding: 36px 18px 18px 18px;

  .popup-title {
    font-size: 24px;
    padding-bottom: 12px;
  }
}
</style>
