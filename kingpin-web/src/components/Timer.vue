<template>
  <span>{{ minutes }} : {{ formatSeconds(seconds) }}</span>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'Timer',
})
export default class Timer extends Vue {
  @Prop({ default: 0, type: Number }) readonly timer!: number;
  @Watch('seconds')
  secondsChanged() {
    if (this.seconds > 0) {
      setTimeout(() => {
        this.seconds--;
      }, 1000);
    } else if (this.minutes > 0) {
      this.seconds = 59;
      this.minutes--;
    } else {
      this.$emit('onExpire');
    }
  }

  mounted() {
    this.minutes = Math.floor(this.timer / 60);
    this.seconds = this.timer - this.minutes * 60;
  }

  public formatSeconds(seconds: number) {
    const secondsStr = seconds.toString();
    if (secondsStr.length === 1) return `0${secondsStr}`;
    return secondsStr;
  }

  private minutes = 99;
  private seconds = 99;
  private loading = false;
}
</script>
