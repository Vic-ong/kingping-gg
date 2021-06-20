<template>
  <div class="main-container">
    <v-card tile flat class="card-container transparent">
      <div class="title-font card-title">Select a Game Mode</div>
      <div v-for="(mode, i) in modes" v-bind:key="i">
        <v-btn @click="selectQuads(mode.key)" color="secondary" class="main-btn mt-3" tile large>
          {{ mode.name }}
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'mainFooter',
})
export default class SignUpForm extends Vue {
  private modes = [
    {
      key: 'br_brquads',
      name: 'BR Quads',
    },
    {
      key: 'br_brtrios',
      name: 'BR Trios',
    },
    {
      key: 'br_brduos',
      name: 'BR Duos',
    },
    {
      key: 'br_brsolo',
      name: 'BR Solos',
    },
  ];

  public selectQuads(mode: string) {
    this.$emit('next', {
      param: 'mode',
      value: mode,
    });
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  .card-container {
    .card-title {
      font-size: 32px;
    }

    .main-btn {
      min-width: 120px;
    }
  }
}
</style>
