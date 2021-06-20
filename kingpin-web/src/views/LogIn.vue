<template>
  <PageContainer class="background">
    <div class="page">
      <v-card class="card-wrapper transparent" tile flat>
        <LogInForm />
      </v-card>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import PageContainer from '@/components/layouts/PageContainer.vue';
import LogInForm from '@/components/LogInForm.vue';

@Component({
  name: 'LogIn',
  components: {
    LogInForm,
    PageContainer,
  },
})
export default class LogIn extends Vue {}
</script>

<style lang="scss" scoped>
.page {
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;

  .card-wrapper {
    width: 450px;
  }
}
</style>
