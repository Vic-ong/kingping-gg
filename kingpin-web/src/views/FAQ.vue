<template>
  <PageContainer>
    <div class="content-container pa-5">
      <!-- Get Started -->
      <div class="title-font page-title">FAQ</div>
      <div class="mt-3 mb-3 text-container">
        <p class="title-font main-title">{{ rules.title }}</p>
        <div v-for="(content, i) in rules.contents" v-bind:key="content" class="mt-3">{{ i + 1 }}. {{ content }}</div>
      </div>
      <div v-for="item in items" v-bind:key="item.title" class="mt-3 mb-3 text-container">
        <p class="title-font main-title">{{ item.title }}</p>
        <div v-for="content in item.contents" v-bind:key="content" class="mt-3">
          {{ content }}
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import PageContainer from '@/components/layouts/PageContainer.vue';

@Component({
  name: 'FAQ',
  components: {
    PageContainer,
  },
})
export default class FAQ extends Vue {
  private rules = {
    title: 'What are the rules?',
    contents: [
      'No easter eggs',
      'No juggernaut suits',
      'No specialist perk',
      'No in game glitches may be used for player advantage',
      'Crossplay must be enabled',
    ],
  };
  private items = [
    {
      title: 'How are my odds calculated?',
      contents: [
        'We use our own algorithm to analyze your game data and provide betting options that allow for a positive experience. Since we are a skill based betting platform, different players may see different betting options.',
      ],
    },
    {
      title: 'How does the promotional bonus work?',
      contents: [
        'All new players receive a free $10 bet to try us out. All $10 must be used on the first bet in order for it to be valid. Bettor keeps all winnings (payout minus promotional amount). Same rules apply to referral bonuses.',
      ],
    },
    {
      title: 'How do referral bonuses work?',
      contents: [
        'At Kingpin, players are rewarded for bringing their friends into the community! Players receive $10 for each user they refer, after their referral has placed a valid $10 wager. If your referral concedes defeat without playing a match, it doesn’t count.',
        'Please only refer friends that will add to the community.',
        'Reach out to us on Discord to claim your referral bonus.',
      ],
    },
    {
      title: 'What happens if I lag out of the game and/or get an error?',
      contents: [
        'If you get a “Disconnected from Server” error, your bet will be automatically refunded to you in an hour. There is no need to report this.',
        'Connection time out/lost connection to server errors will only be refunded if time played is less than 3 minutes and all team members have 0 deaths. In this case, if team members would like to restart the wager, the party leader must withdraw everyone from the game and contact support for assistance.',
        'All other errors will be handled on a case by case basis. You MUST provide video evidence by capturing the last 2minutes on your console. Disputes without video evidence will be rejected.',
      ],
    },
    {
      title: 'What happens if my teammate lags out of the game or gets an error?',
      contents: [
        'If teammates lag out or drop from the game, the wager stands and play must continue.',
        'Exceptions will only be made if time played is less than 3 minutes and all team members have 0 deaths. In this case, if team members would like to restart the wager, the party leader must withdraw everyone from the game and contact support for assistance.',
      ],
    },
    {
      title: 'I know I started my match in time but my wager result showed up as being invalid. What do I do?',
      contents: [
        'In rare circumstances, Activision won’t return a result for a match that has occurred. In these cases, since we don’t have any data on the match, we can’t verify whether it was a win or a loss so your wager will be marked as invalid.',
        'If you see your match at https://cod.tracker.gg/warzone and it shows as invalid on Kingpin, then please reach out to support on Discord to get it resolved.',
      ],
    },
    {
      title: 'Will I be able to withdraw funds?',
      contents: [
        'Yes! After all, players use the site to win cash prizes 🤑',
        'All withdrawals are paid via PayPal only. No exceptions. Message us on Discord to withdraw funds.',
      ],
    },
    {
      title: 'How long until I get paid?',
      contents: [
        'Usually within 1 business day, but up to 3-5 business days.',
        'ID must be verified via Discord video call prior to first withdrawal.',
      ],
    },
    {
      title: 'My account information doesn’t match what’s on my ID, can I still withdraw funds?',
      contents: [
        'All account information must match what is on your ID. Any discrepancies will result in your account being suspended and your funds will be forfeited.',
      ],
    },
  ];
}
</script>

<style lang="scss" scoped>
.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: left;

  > * {
    max-width: 600px;
    font-size: 14px;
  }
}
.page-title {
  font-size: 48px;
}
.main-title {
  font-size: 24px;
}
.text-container {
  width: 100%;
}
</style>
