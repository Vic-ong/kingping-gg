<template>
  <PageContainer>
    <div class="content-container pa-5">
      <div class="grey lighten-4 pa-3 mt-3 mb-3">
        <div>
          To get your free $10:
          <a class="link secondary--text" :href="discord.link">{{ discord.text }}</a>
          or email
          <a class="link secondary--text" :href="email.link">{{ email.text }}</a>
        </div>
      </div>
      <!-- Get Started -->
      <div class="mt-3 mb-3">
        <p class="title-font main-title">Placing a Bet</p>
        <div class="text-container">
          <div v-for="(item, i) in getStarted" v-bind:key="item.text">
            <div class="text-content text-main mt-3">
              <div class="mr-2">{{ i + 1 }}.</div>
              <div>{{ item.text }}</div>
            </div>
            <div v-for="(sub, n) in item.sub" v-bind:key="sub">
              <div class="text-content mt-1 ml-5">
                <div class="mr-2">{{ (n + 10).toString(36) }}.</div>
                <div>{{ sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Depositing/Wagering -->
      <div class="mt-3 mb-3">
        <p class="title-font main-title">Depositing/Withdrawing</p>
        <div class="text-container">
          <div class="text-content text-main mt-3">
            <div class="mr-2">1.</div>
            <div>
              <a class="link secondary--text" :href="discord.link">{{ discord.text }}</a>
              or email us at
              <a class="link secondary--text" :href="email.link">{{ email.text }}</a>
              to withdraw funds from your account
            </div>
          </div>
          <div v-for="(item, i) in deposit" v-bind:key="item">
            <div class="text-content text-main mt-3">
              <div class="mr-2">{{ i + 2 }}.</div>
              <div>{{ item }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grey lighten-4 pa-3 mt-3 mb-3">
        <div>
          *If you have received a free $10, you must have bet at least $10 on the site before being eligible to withdraw
          funds.
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import PageContainer from '@/components/layouts/PageContainer.vue';

@Component({
  name: 'Instructions',
  components: {
    PageContainer,
  },
})
export default class Instructions extends Vue {
  private email = {
    text: 'payments@kingpin.gg',
    link: 'mailto:payments@kingpin.gg?subject=Deposit/Withdraw Fund',
  };
  private discord = {
    text: 'Message us on discord',
    link: 'https://discord.gg/7JazznK',
  };
  private getStarted = [
    {
      text: "Select 'Place a bet'",
    },
    {
      text: 'Select a game mode',
      sub: [
        "If you are playing with teammates (duos, trios, quads), you will need to input their Activision ID's. Console ID's will not work.",
        "Activision ID's are usually in the following format: [username]#[numbers]. Do not include clan tags.",
        'If the only characters after a teammates Activision ID are "#0" then DO NOT include "#0"',
      ],
    },
    {
      text:
        "Choose from one of the provided options. The odds are based on you and your teammates' skill level. For example:",
      sub: [
        'Your team winning the match (warzone victory): 6x (+500)',
        'Your team placing top 5: 3x (+200)',
        'Yourself getting at least x number of kills: 2x (+100)',
      ],
    },
    {
      text: "Enter the amount you'd like to bet and select 'Proceed'",
    },
    {
      text: 'Start your match',
      sub: [
        'Match must begin within 5 minutes after your bet is confirmed. Bets placed after match has started will not be counted.',
        "If a match isn't started within 5 minutes, the system won't find your match. In this case, you will be refunded your bet amount in about an hour.",
        'To ensure there are no errors, start the queue after placing a bet. Do not place a bet while in queue.',
      ],
    },
  ];

  private deposit = [
    'The next feature set for the site will include a PayPal integration. Until then, we are handling payments via PayPal, Venmo, or CashApp.',
    'Requests for withdrawing funds will be reviewed and funds will be sent out within 3 days.',
  ];
}
</script>

<style lang="scss" scoped>
.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > * {
    max-width: 500px;
    font-size: 14px;
  }
}
.main-title {
  font-size: 28px;
}
.text-container {
  text-align: left;
  max-width: 500px;
}
.text-content {
  display: flex;
  flex-direction: row;
}
.text-main {
  font-size: 16px;
  font-weight: 600;
}
</style>
