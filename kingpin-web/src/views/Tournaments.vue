<template>
  <PageContainer style="min-height: 100vh;">
    <h1 class="mt-3">Tournaments</h1>
    <div v-if="isLoading" class="d-flex justify-center py-10">
      <v-progress-circular class="mb-5" size="80" width="6" color="secondary" indeterminate />
    </div>
    <div v-if="isError" class="d-flex justify-center py-10">
      <div class="title-font" style="font-size: 24px;">Internal Error. Please contact our support team.</div>
    </div>
    <v-row v-else>
      <v-col cols="12" sm="6" v-for="item in activeTournaments" v-bind:key="item._id">
        <v-card @click="routeHandler(item)" style="cursor: pointer;">
          <v-toolbar color="primary" dark>
            <div class="title-font" style="font-size: 24px;">
              {{ item.name }}
            </div>
          </v-toolbar>
          <div class="text-left pa-5">
            <div class="d-flex title-font" style="font-size: 18px;">
              {{ item.description }}
            </div>
            <div class="d-flex mt-3" style="font-size: 14px;">
              <v-icon color="black" class="mr-2">fa-donate</v-icon>
              {{ minPayoutText(item) }}
            </div>
            <div class="d-flex mt-3" style="font-size: 14px;">
              <v-icon color="black" class="mr-2">fa-hourglass-start</v-icon>
              {{ lengthText(item) }}
            </div>
            <div class="d-flex mt-3" style="font-size: 14px;">
              <v-icon color="black" class="mr-2">fa-clock</v-icon>
              {{ startTimeText(item) }}
            </div>
            <div class="d-flex mt-3" style="font-size: 14px;">
              <v-icon color="black" class="mr-2">fa-clock</v-icon>
              {{ endTimeText(item) }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="450">
      <v-card class="text-left pa-5">
        <div class="mb-2">
          This tournament hasn't start. Please come back again on the start date and time of the tournament.
        </div>
        <v-card-actions class="justify-center">
          <v-btn @click="dialog = false" color="secondary" tile large>Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { TournamentListState, Tournament } from '@/store/tournament/types';
import { formatTimestamp, hoursDifference } from '@/utils/datetime';
import PageContainer from '@/components/layouts/PageContainer.vue';

const tournament = namespace('tournament');

@Component({
  name: 'Tournaments',
  components: {
    PageContainer,
  },
})
export default class Wager extends Vue {
  mounted() {
    this.getTournamentList();
  }

  @tournament.Action
  public getTournamentList!: () => void;

  @tournament.Getter
  public tournamentList!: TournamentListState;

  private dialog = false;
  private dateTimeFormat = 'MMM DD, h:mm A';

  get isLoading() {
    return this.tournamentList.loading;
  }
  get isError() {
    return this.tournamentList.error;
  }
  get activeTournaments() {
    if (this.tournamentList.data) {
      const currentTime = new Date().getTime() / 1000;

      return this.tournamentList.data.filter((t) => t.endTime.seconds - currentTime > 0);
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tournamentStarted(t: any) {
    const currentTime = new Date().getTime() / 1000;
    return currentTime - t.startTime.seconds > 0;
  }
  public minPayoutText(item: Tournament) {
    return `$${item.minPayout} Guaranteed`;
  }
  public lengthText(item: Tournament) {
    const { startTime, endTime } = item;
    const diff = hoursDifference(startTime, endTime);

    return `Challenge opens for ${diff} hours`;
  }
  public startTimeText(item: Tournament) {
    const date = formatTimestamp(item.startTime, this.dateTimeFormat);

    return `Starts on ${date}`;
  }
  public endTimeText(item: Tournament) {
    const date = formatTimestamp(item.endTime, this.dateTimeFormat);

    return `Ends on ${date}`;
  }
  public routeHandler(item: Tournament) {
    if (this.tournamentStarted(item)) {
      this.$router.push({
        name: 'tournaments/:id/wager',
        params: {
          id: item._id,
        },
      });
    } else {
      this.dialog = true;
    }
  }
}
</script>
