<template>
  <div class="content-container mt-5 mb-5" :style="containerStyles">
    <!-- data error -->
    <div v-if="userWagers.error">
      <v-card tile flat class="status-container transparent">
        <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
        <div class="title-font">Ops! We encountered an internal error 😰</div>
        <div class="title-font">Please contact our team for support</div>
      </v-card>
    </div>
    <!-- data loading -->
    <div v-else-if="userWagers.loading">
      <div class="status-container">
        <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
        <div class="title-font">Loading...</div>
      </div>
    </div>

    <div v-else class="table-view-container grey lighten-5 elevation-5">
      <div class="title-font main-title">Recent Wagers/Matches</div>
      <div v-if="items.length === 0">
        <p>
          Unable to find any records. Please proceed to
          <router-link :to="{ name: 'wager' }" class="secondary--text"> place a bet. </router-link>
        </p>
      </div>
      <div v-else>
        <v-simple-table fixed-header height="400px" class="transparent">
          <template v-slot:default>
            <thead>
              <tr>
                <th v-for="field in fields" v-bind:key="field.name" class="text-left grey lighten-5">
                  {{ field.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" v-bind:key="item.name" @click="routeToWager(item._id)" style="cursor: pointer;">
                <td v-for="field in fields" v-bind:key="field.name" class="text-left">
                  {{ item[field.value] }}
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { WagerListState } from '@/store/wager/types';
import { formatTimestamp } from '@/utils/datetime';

const wager = namespace('wager');

interface GetWagerParamsProps {
  userId: string;
  limit: number;
}

@Component({
  name: 'UserWagers',
})
export default class UserWagers extends Vue {
  @Prop() userId!: string;
  @wager.Action
  public getWagersByUser!: (params: GetWagerParamsProps) => void;
  @wager.Getter
  public userWagers!: WagerListState;

  created() {
    this.getWagersByUser({
      userId: this.userId,
      limit: 10,
    });
  }

  private fields = [
    {
      name: 'Bet On',
      value: 'createdAt',
    },
    {
      name: 'Mode',
      value: 'mode',
    },
    {
      name: 'Bet',
      value: 'betName',
    },
    {
      name: 'Amount : Payout',
      value: 'amountPayout',
    },
    {
      name: 'Outcome',
      value: 'outcome',
    },
  ];

  get loading() {
    return this.userWagers.loading;
  }

  public mapMode(outcome: string) {
    switch (outcome) {
      case 'br_brsolo':
        return 'solo';
      case 'br_brduos':
        return 'duos';
      case 'br_brtrios':
        return 'trios';
      case 'br_brquads':
        return 'quads';
      default:
        return 'solo';
    }
  }

  get items() {
    if (this.userWagers.data) {
      return this.userWagers.data.map((d) => ({
        _id: d._id,
        createdAt: formatTimestamp(d.createdAt),
        mode: this.mapMode(d.mode),
        betName: d.bettingOdds.name,
        amountPayout: `$ ${d.amount} : ${d.payout}`,
        outcome: d.outcome,
      }));
    }
    return [];
  }

  get isXs() {
    return this.$vuetify.breakpoint.xs;
  }

  get containerStyles() {
    return {
      '--flex-direction': this.isXs ? 'column' : 'row',
      '--margin': this.isXs ? '0 12px' : '0',
    };
  }

  public routeToWager(id: string) {
    this.$router.push({ name: 'result', params: { id } });
  }
}
</script>

<style lang="scss" scoped>
.content-container {
  display: flex;
  flex-direction: var(--flex-direction);
  margin: var(--margin);
  justify-content: center;
  align-items: center;
}

.status-container {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-title {
  font-size: 28px;
  margin-bottom: 12px;
}

.table-view-container {
  flex: 1;
  width: 100%;
  padding: 20px;
  border-radius: 12px;
}
</style>
