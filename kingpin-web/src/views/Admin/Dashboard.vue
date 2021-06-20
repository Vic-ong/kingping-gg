<template>
  <PageContainer>
    <div class="page">
      <v-card v-if="displayContent === 'content'" class="card-wrapper transparent" tile flat>
        <ServiceCredentialsPanel :data="credentials.data" />
        <UserListPanel :data="userList.data" />
        <WagerListPanel :data="wagerList.data" />
      </v-card>

      <v-card v-if="displayContent === 'loading'" class="card-wrapper transparent" tile flat>
        <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
        <div class="title-container">
          <div class="title-font result-title">Retrieving data...</div>
        </div>
      </v-card>

      <v-card v-if="displayContent === 'error'" class="card-wrapper transparent" tile flat>
        <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
        <div class="title-container">
          <div class="title-font result-title">Internal Error!</div>
          <div class="title-font result-title">Please check the logs for server error</div>
        </div>
      </v-card>

      <v-card v-if="displayContent === 'noAccess'" class="card-wrapper transparent" tile flat>
        <v-icon class="ma-3" color="info" x-large>fa-lock</v-icon>
        <div class="title-container">
          <div class="title-font result-title">No Permission!</div>
          <div class="title-font result-title">You do not have access to this page</div>
        </div>
      </v-card>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { CredentialsState } from '@/store/serviceCredentials/types';
import { WagerState } from '@/store/wager/types';
import { UserState } from '@/store/profile/types';
import PageContainer from '@/components/layouts/PageContainer.vue';
import ServiceCredentialsPanel from '@/components/AdminPanel/ServiceCredentialsPanel.vue';
import UserListPanel from '@/components/AdminPanel/UserListPanel.vue';
import WagerListPanel from '@/components/AdminPanel/WagerListPanel.vue';

const serviceCredentials = namespace('serviceCredentials');
const wager = namespace('wager');
const profile = namespace('profile');

interface GetWagerListProps {
  limit?: number;
}

@Component({
  name: 'AdminPanel',
  components: {
    PageContainer,
    ServiceCredentialsPanel,
    UserListPanel,
    WagerListPanel,
  },
})
export default class AdminPanel extends Vue {
  @serviceCredentials.Action
  public getServiceCredentials!: () => void;
  @profile.Action
  public getUserList!: () => void;
  @wager.Action
  public getWagerList!: (param?: GetWagerListProps) => void;

  @serviceCredentials.Getter
  public credentials!: CredentialsState;
  @wager.Getter
  public wagerList!: WagerState;
  @profile.Getter
  public userProfile!: UserState;
  @profile.Getter
  public userList!: UserState;

  mounted() {
    this.getServiceCredentials();
    this.getUserList();
    this.getWagerList();
  }

  get dataList() {
    return [this.credentials, this.wagerList, this.userProfile, this.userList];
  }

  get displayContent(): string {
    if (this.dataList.some(({ loading }) => loading)) {
      return 'loading';
    }
    if (this.dataList.some(({ error }) => error)) {
      return 'error';
    }
    const hasAccess = this.userProfile.data && this.userProfile.data.role === 'admin';
    if (hasAccess) {
      return 'content';
    }
    return 'noAccess';
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: calc(100vh - 212px);
  display: flex;
  justify-content: center;
  padding: 36px;

  .card-wrapper {
    flex: 1;
  }
}
</style>
