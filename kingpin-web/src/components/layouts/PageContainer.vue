<template>
  <div>
    <v-container class="pa-0">
      <slot />
    </v-container>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'pageContainer',
})
export default class PageContainer extends Vue {}
</script>

<style lang="scss" scoped></style>
