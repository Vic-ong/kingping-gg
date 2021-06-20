<template>
  <div class="main-container">
    <v-card v-if="odds.loading || loading" tile flat class="card-container-loading transparent">
      <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
      <div class="title-font">{{ loadingMsg }}</div>
    </v-card>

    <v-card v-else-if="odds.error" tile flat class="card-container-loading transparent">
      <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
      <div class="title-font">Ops! We encountered an internal error 😰</div>
      <div class="title-font">Please contact our team for support</div>
    </v-card>

    <v-card v-else-if="odds.data && odds.data.length > 0" tile flat class="card-container transparent">
      <v-row>
        <v-col cols="12" md="6">
          <v-card tile flat class="transparent" v-bind:style="betContainerStyles">
            <div class="title-font card-title">Select your wagers</div>
            <v-row>
              <v-col v-for="(type, i) in odds.data" v-bind:key="i" cols="12" lg="6" style="min-width: 210px;">
                <v-card
                  v-if="i !== selection"
                  class="wager-item wager-cursor grey lighten-3"
                  v-bind:style="betOptionStyles"
                  flat
                  tile
                  @click="selectWager(type, i)"
                >
                  <div class="title-font content-title">{{ type.name }}</div>
                  <div class="content-detail">x{{ type.multiplier }}/odds</div>
                </v-card>
                <v-card v-else class="accent elevation-4" v-bind:style="betOptionStyles" flat tile>
                  <div class="title-font content-title">{{ type.name }}</div>
                  <div class="content-detail">x{{ type.multiplier }}/odds</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card tile class="content-container-amount background elevation-7">
            <div class="title-font card-title white--text">Your bet</div>
            <v-form ref="form" v-model="valid" lazy-validation>
              <div class="wager-amount-content">
                <p class="estimated-return white--text">Bet amount:</p>
                <v-text-field
                  v-model="input"
                  label="Wager amount"
                  prefix="$"
                  :rules="[rules.required, rules.isCurrency]"
                  required
                  solo
                />
                <p class="estimated-return white--text">Payout:</p>
                <div class="payout-container">$ {{ payoutDisplay }}</div>

                <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
                <v-btn :loading="loading" @click="confirmBet" color="secondary" class="main-btn mt-5" tile large>
                  Proceed
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-else tile flat class="card-container-loading transparent">
      <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
      <div class="title-font">We're unable to provide any bets for you 😰</div>
      <div class="title-font">Please try another game mode</div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { CurrencyProps } from '@/store/types';
import { UserState, PlatformId } from '@/store/profile/types';
import { OddsState } from '@/store/callofduty/types';
import { NewTransactionProps } from '@/store/ledger/types';
import { round } from '@/utils/formats';
import Currency from '@/utils/currency';
import { sendSlackMsg } from '@/services/functions/slack';

interface GetOddsParamProps {
  userId: string;
  activisionId: string;
  platformId: PlatformId;
  partyIds: string[];
  mode: string;
}

type VForm = Vue & { validate: () => boolean };

const profile = namespace('profile');
const callofduty = namespace('callofduty');
const wager = namespace('wager');
const ledger = namespace('ledger');

interface BettingOdds {
  _id: string;
  name: string;
  multiplier: number;
}

interface UpdateUserProps {
  id: string;
  currentBalance: CurrencyProps;
  updatedAt: Date;
}

interface ParamsProps {
  mode: string;
  partyIds: string[];
  [key: string]: string | string[];
}

@Component({
  name: 'mainFooter',
})
export default class SignUpForm extends Vue {
  @Ref('form') readonly form!: VForm;
  @Prop() params!: ParamsProps;

  mounted() {
    if (this.userProfile.data) {
      this.getOdds({
        userId: this._.get(this.userProfile, 'data._id'),
        activisionId: this._.get(this.userProfile, 'data.activisionId'),
        platformId: this._.get(this.userProfile, 'data.platformId'),
        partyIds: this.params.partyIds,
        mode: this.params.mode,
      });
    }
  }

  @profile.Getter
  public userProfile!: UserState;
  @callofduty.Getter
  public odds!: OddsState;

  @profile.Action
  public updateUser!: (param: UpdateUserProps) => void;
  @callofduty.Action
  public getOdds!: (param: GetOddsParamProps) => void;
  @wager.Action
  public createWager!: (newWager: object) => string;
  @ledger.Action
  public createTransaction!: (newTransaction: NewTransactionProps) => void;

  private rules = {
    required: (v: string) => !!v || 'This field is required',
    isCurrency: (v: string) => this.isValidCurrency(v) || 'Invalid currency',
  };

  private valid = true;
  private selection: number | null = null;
  private bettingOdds: BettingOdds | null = null;
  private input = '10.00';
  private loadingMsg = 'Configuring Betting Odds...';
  private loading = false;
  private status = {
    classStyle: '',
    message: '',
  };

  get isXS() {
    return this.$vuetify.breakpoint.xs;
  }

  get betContainerStyles() {
    return {
      height: '100%',
      padding: this.isXS ? '0' : '12px 24px',
    };
  }

  get betOptionStyles() {
    return {
      padding: this.isXS ? '8px' : '24px',
      cursor: 'pointer',
    };
  }

  get payoutDisplay(): number | string {
    if (this.isValidCurrency(this.input) !== true || !this.bettingOdds) return '-';
    const estValue = Number(this.input) * this.bettingOdds.multiplier;
    return round(estValue, 2);
  }

  get payout(): number | undefined {
    if (!this.bettingOdds) return undefined;
    const estValue = Number(this.input) * this.bettingOdds.multiplier;
    return round(estValue, 2);
  }

  get balance() {
    if (this.userProfile.data) {
      return new Currency(this.userProfile.data.currentBalance);
    }
    return new Currency({
      currency: 'USD',
      dollars: 0,
      cents: 0,
    });
  }

  get balanceValue() {
    return this.balance.objToCurrencyNum();
  }

  public getMaxAmount() {
    return 50;
  }

  public isValidCurrency(v: string) {
    if (this.userProfile.data) {
      if (Number.isNaN(Number(v))) return false;
      if (Number(v) < 1) return '$1.00 is the minimum amount';
      if (Number(v) > this.getMaxAmount()) return `$${this.getMaxAmount()} is the maximum amount`;
      if (Number(v) > this.balanceValue) return 'Bet cannot exceed your available balance';

      const regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
      return regex.test(v);
    }
    return false;
  }

  public selectWager(bettingOdds: BettingOdds, index: number) {
    this.selection = index;
    this.bettingOdds = bettingOdds;
  }

  public async confirmBet() {
    this.valid = this.form ? this.form.validate() : false;
    const numbersValid = this.payout && !Number.isNaN(Number(this.input));
    const selectionValid = this.selection !== null;

    if (this.valid && this.userProfile.data && selectionValid && numbersValid) {
      try {
        this.loading = true;
        this.loadingMsg = 'Setting up your bet...';
        // deduct current balance
        const newBalance = this.balance.subtract(Number(this.input));
        const newDate = new Date();

        const newTransaction = {
          amount: Number(this.input),
          description: 'wager placement',
          user: {
            _id: this.userProfile.data._id,
            firstName: this.userProfile.data.firstName,
            lastName: this.userProfile.data.lastName,
            previousBalance: this.userProfile.data.currentBalance,
            currentBalance: newBalance,
          },
          createdAt: newDate,
          updatedAt: newDate,
        };

        const userUpdateBalance = {
          id: this.userProfile.data._id,
          currentBalance: newBalance,
          updatedAt: newDate,
        };

        await this.createTransaction(newTransaction);
        await this.updateUser(userUpdateBalance);

        // create new wager doc
        const wagerId = await this.createNewWager();

        // the create object process is too fast
        // a hard-coded timer is set to smoothen the UX
        if (wagerId) {
          await setTimeout(() => {
            this.loading = false;
            this.$router.push({ name: 'result', params: { id: wagerId } });
          }, 1500);
        }
      } catch (err) {
        this.loading = false;
        this.status = {
          classStyle: 'error--text',
          message: err.message,
        };
        sendSlackMsg(err.message || err, 'WagerSelection');
      }
    }
  }

  public createNewWager() {
    if (this.userProfile.data && this.payout) {
      const params = {
        ...this.params,
        user: {
          _id: this._.get(this.userProfile, 'data._id'),
          firstName: this._.get(this.userProfile, 'data.firstName'),
          lastName: this._.get(this.userProfile, 'data.lastName'),
          activisionId: this._.get(this.userProfile, 'data.activisionId'),
          platformId: this._.get(this.userProfile, 'data.platformId'),
        },
        outcome: 'pending',
        amount: Number(this.input),
        payout: this.payout,
        bettingOdds: this.bettingOdds,
        status: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return this.createWager(params);
    }
    return undefined;
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  .card-container-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px;
    font-size: 24px;
  }

  .card-container {
    width: 90%;

    .card-title {
      font-size: 32px;
    }
    .main-btn {
      min-width: 120px;
    }

    .content-container-type {
      height: 100%;
      padding: 12px 24px;

      .wager-cursor {
        cursor: pointer;
      }

      .content-title {
        font-size: 20px;
      }
      .content-detail {
        font-size: 12px;
      }
    }

    .content-container-amount {
      height: 100%;
      padding: 12px 20%;

      .wager-amount-content {
        margin-top: 15%;

        .estimated-return {
          text-align: left;
        }

        .payout-container {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 50px;
          border-radius: 4px;
          border: gray 1px solid;
          font-size: 18px;
          font-weight: 600;
          color: white;
        }
      }
    }
  }

  .wager-item {
    position: relative;
  }

  .wager-banner {
    position: absolute;
    top: 0;
    left: 0;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 0 0 8px 0;
  }
}

.disable-events {
  pointer-events: none;
}
</style>
