<template>
  <v-card class="pa-5 background" dark>
    <div v-if="isLoading" class="buffer-container">
      <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
      <div class="title-font">Retrieving your team info...</div>
    </div>

    <div v-else-if="isError" class="buffer-container">
      <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
      <div class="title-font">Internal Error!</div>
      <div style="font-size: 14px;">
        Please contact our admin team on the
        <a href="https://discord.gg/S2XAfJj" target="_blank" class="secondary--text">discord channel</a>.
      </div>
    </div>

    <div v-else-if="invalidData" class="invalid-team-container">
      <div class="title-font" style="font-size: 24px;">You are not registered for this tournament!</div>
      <div class="mt-5">
        <span>Please contact our admin team on </span>
        <a href="https://discord.gg/S2XAfJj" class="secondary--text">the Discord channel</a>
        <span> if you are interested to join.</span>
      </div>
    </div>

    <div v-else>
      <div class="d-flex title-font" style="font-size: 18px;">Game Mode</div>
      <v-row dense>
        <v-col cols="12">
          <div class="reg-text d-flex mt-3">
            <span>{{ modeDisplay }}</span>
          </div>
        </v-col>
      </v-row>

      <div class="d-flex title-font mt-5" style="font-size: 18px;">Team: {{ team.data && team.data.name }}</div>
      <v-row v-if="team.data" dense>
        <v-col cols="12" v-for="member in team.data.members" v-bind:key="member.activisionId">
          <div v-if="member.platformId" class="reg-text d-flex mt-3">
            <v-icon class="mr-3" dark>{{ getIcon(member.platformId) }}</v-icon>
            <span>{{ member.platformId.username }}; {{ member.activisionId }}</span>
          </div>
          <div v-else>
            <v-icon class="mr-3" dark>fa-user-circle</v-icon>
            <span>N/A</span>
          </div>
        </v-col>
      </v-row>
      <v-card-actions class="justify-center mt-5">
        <v-btn @click="placeWagerHandler" :loading="loading" color="secondary" class="mt-3" tile large>
          Place Wager
        </v-btn>
      </v-card-actions>
    </div>

    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card v-if="verifyLoading" class="py-10">
        <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
        <div class="title-font">Verifying your team info...</div>
      </v-card>

      <v-card v-else-if="verifyError" class="py-5">
        <div class="title-font">Failed to verify users!</div>
        <v-card-text style="font-size: 14px;">
          Please contact our admin team on the
          <a href="https://discord.gg/S2XAfJj" target="_blank" class="secondary--text">discord channel</a>.
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" :loading="loading" color="secondary" tile large>Close</v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="!valid || invalidIds.length > 0" class="py-5">
        <v-card-text class="text-left black--text">
          <b>Error!</b>
          The following activision/platform ID(s) are invalid. Please correct them and retry.
        </v-card-text>
        <v-card-text>
          <div v-for="item in invalidIds" v-bind:key="item" class="d-flex mb-2">
            <v-icon color="error" class="mr-2">fa-exclamation-circle</v-icon>
            <span>{{ item }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" :loading="loading" color="secondary" tile large>Close</v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="hitMaxCount" class="pa-5">
        <v-card-text class="text-left black--text">
          Your team has hit the maximum number of wagers placed for this tournament
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" :loading="loading" color="secondary" tile large>Close</v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="balanceValue >= tournament.amount" class="py-5">
        <v-card-text class="text-left black--text">
          <b>Note:</b>
          {{ confirmNote }}
        </v-card-text>
        <v-card-text class="d-flex black--text">
          <div>Game Mode:</div>
          <b class="ml-3">{{ modeDisplay }}</b>
        </v-card-text>
        <v-card-text class="d-flex black--text">
          <div>Wager Amount:</div>
          <b class="ml-3">${{ tournament.amount }}</b>
        </v-card-text>
        <v-card-text class="d-flex black--text">
          <div>Balance:</div>
          <b class="ml-3">${{ balanceValue }} --> ${{ balanceAfterWagerText }}</b>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" :loading="loading" color="primary" class="mr-3" tile large>Cancel</v-btn>
          <v-btn @click="submitHandler" :loading="loading" color="secondary" tile large>Confirm Wager</v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else class="py-5">
        <v-card-text class="text-left black--text">{{ insufficientFundText }}</v-card-text>
        <v-card-text class="text-left black--text">
          <span>You can add your balance on the </span>
          <router-link :to="{ name: 'deposit' }" class="secondary--text">Deposit page.</router-link>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" :loading="loading" color="secondary" tile large>Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { validateUsers } from '@/services/functions/callofduty';
import { User, PlatformId } from '@/store/profile/types';
import { TeamDataState } from '@/store/team/types';
import { Tournament } from '@/store/tournament/types';
import { CurrencyProps } from '@/store/types';
import { NewTransactionProps } from '@/store/ledger/types';
import Currency from '@/utils/currency';
import PageContainer from '@/components/layouts/PageContainer.vue';

const profile = namespace('profile');
const team = namespace('team');
const wager = namespace('wager');
const ledger = namespace('ledger');

interface UpdateUserProps {
  id: string;
  currentBalance: CurrencyProps;
  updatedAt: Date;
}
interface UpdateTeamProps {
  id: string;
  count: number;
  updatedAt: Date;
}
interface ModesProps {
  [index: number]: string | string[];
}

@Component({
  name: 'Tournaments',
  components: {
    PageContainer,
  },
})
export default class Wager extends Vue {
  @Prop({ default: () => null, type: Object }) readonly tournament!: Tournament;
  @Prop({ default: () => null, type: Object }) readonly userProfile!: User;

  mounted() {
    if (this.userProfile) {
      this.getTeam(this.userProfile._id);
    }
  }

  @team.Action
  public getTeam!: (id: string) => void;
  @wager.Action
  public createWager!: (newWager: object) => string;
  @ledger.Action
  public createTransaction!: (newTransaction: NewTransactionProps) => void;
  @profile.Action
  public updateUser!: (param: UpdateUserProps) => void;
  @team.Action
  public updateTeam!: (param: UpdateTeamProps) => void;

  @team.Getter
  public team!: TeamDataState;

  private verifyLoading = false;
  private verifyError = false;
  private valid = true;
  private invalidIds = [];
  private dialog = false;
  private loading = false;
  private dateTimeFormat = 'MMM DD, h:mm A';
  private modes: ModesProps = ['br_brsolo', 'br_brduos', 'br_brtrios', 'br_brquads'];
  private modeDisplays: ModesProps = ['BR Solo', 'BR Duos', 'BR Trios', 'BR Quads'];
  private confirmNote =
    'Please place your wager around the same time with your teammates and start your match within 5 minutes after placing the bet.';
  get insufficientFundText() {
    // eslint-disable-next-line max-len
    return `You have insufficient fund in your balance. A wager placement for this tournament is $${this.tournament.amount}.`;
  }

  get isLoading() {
    return this.team.loading;
  }
  get isError() {
    return this.team.error;
  }
  get invalidData() {
    return this.team.data && (!this.team.data.name || this.team.data.members.length === 0);
  }
  get hitMaxCount() {
    if (this.team.data) {
      const cap = this.team.data.max - this.team.data.members.length;
      return this.team.data.count > cap;
    }
    return false;
  }
  get modeDisplay() {
    const index = Number(this.partyIds.length);
    return this.modeDisplays[index];
  }
  get partyIds() {
    if (this.team.data && Array.isArray(this.team.data.members)) {
      return (
        this.team.data.members
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((member: any) => member.activisionId !== this.userProfile.activisionId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((member: any) => member.activisionId)
      );
    }
    return [];
  }
  get balance() {
    if (this.userProfile) {
      return new Currency(this.userProfile.currentBalance);
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
  get balanceAfterWager() {
    const b = this.balance.subtract(Number(this.tournament.amount));
    return b;
  }
  get balanceAfterWagerText() {
    const b = this.balanceAfterWager;
    return new Currency(b).objToCurrencyNum();
  }
  public getIcon(platformId: PlatformId) {
    if (!platformId) return 'fa-circle-user';
    const { platform } = platformId;
    switch (platform) {
      case 'xbl':
        return 'fab fa-xbox';
      case 'psn':
        return 'fab fa-playstation';
      case 'steam':
        return 'fab fa-steam';
      case 'battle':
        return 'fab fa-battle-net';
      default:
        return 'fa-circle-user';
    }
  }
  public async placeWagerHandler() {
    try {
      this.verifyError = false;
      this.verifyLoading = true;
      this.dialog = true;
      this.invalidIds = [];

      await this.validate();
      this.verifyLoading = false;
    } catch (err) {
      this.verifyError = true;
      this.verifyLoading = false;
      console.error(err);
    }
  }
  public async validate() {
    if (this.team.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (this.team.data.members.some((member: any) => !member.platformId)) {
        this.valid = false;
      } else {
        const res = await validateUsers({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          usernames: this.team.data.members.map((member: any) => member.platformId),
        });
        this.invalidIds = res;
        this.valid = res.length === 0;
      }
    }
  }
  public async submitHandler() {
    if (this.userProfile && this.team.data && this.tournament) {
      try {
        this.loading = true;
        // deduct current balance
        const newBalance = this.balance.subtract(Number(this.tournament.amount));
        const newDate = new Date();

        const newTransaction = {
          amount: this.tournament.amount,
          description: 'wager placement',
          user: {
            _id: this.userProfile._id,
            firstName: this.userProfile.firstName,
            lastName: this.userProfile.lastName,
            previousBalance: this.userProfile.currentBalance,
            currentBalance: newBalance,
          },
          createdAt: newDate,
          updatedAt: newDate,
        };

        const userUpdateBalance = {
          id: this.userProfile._id,
          currentBalance: newBalance,
          updatedAt: newDate,
        };

        const teamCountUpdate = {
          id: this.team.data._id,
          count: this.team.data.count + 1,
          updatedAt: newDate,
        };

        await this.createTransaction(newTransaction);
        await this.updateUser(userUpdateBalance);
        await this.updateTeam(teamCountUpdate);

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
        console.error(err);
      }
    }
  }
  public createNewWager() {
    if (this.userProfile && this.team.data && this.tournament) {
      const index = Number(this.partyIds.length);
      const params = {
        mode: this.modes[index],
        partyIds: this.partyIds,
        user: {
          _id: this.userProfile._id,
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          activisionId: this.userProfile.activisionId,
          platformId: this.userProfile.platformId,
        },
        teamId: this.team.data._id,
        outcome: 'pending',
        amount: Number(this.tournament.amount),
        payout: 0,
        bettingOdds: {
          _id: this.tournament.betId,
          name: this.tournament.name,
        },
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
.buffer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  font-size: 24px;
}
.invalid-team-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}
.reg-text {
  font-size: 14px;
}
</style>
