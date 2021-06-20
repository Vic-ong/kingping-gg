<template>
  <div>
    <v-card class="panel-container elevation-5" style="margin-top: 48px;">
      <div class="panel-header">
        <div class="title-font panel-title-container secondary elevation-5">Service Credentials</div>
      </div>
      <div class="content-container">
        <div class="title-font main-title">Active Service Account</div>
        <p>Last updated: {{ lastUpdated }}</p>
        <div class="selector-container">
          <v-select
            :items="items"
            label="Service Account"
            v-model="selected"
            item-text="text"
            item-value="value"
            class="selector"
            outlined
          />
          <div class="ml-5">
            <transition>
              <v-flex v-if="status.key === 'pass'" key="pass">
                <v-icon color="green" medium>fa-check-circle</v-icon>
                {{ status.msg }}
              </v-flex>
              <v-flex v-if="status.key === 'failed'" key="failed">
                <v-icon color="error" medium>fa-exclamation-circle</v-icon>
                {{ status.msg }}
              </v-flex>
              <v-flex v-if="status.key === 'info'" key="info">
                <v-icon color="info" medium>fa-info-circle</v-icon>
                {{ status.msg }}
              </v-flex>
            </transition>
          </div>
        </div>
        <div class="selector-container mt-3 mb-3">
          <!-- <v-btn
            :loading="testBtn.loading"
            :disabled="testBtn.disabled"
            @click="testConnection"
            class="selector-btn"
            color="primary"
            tile
            large
          >
            {{ testBtn.text }}
          </v-btn> -->
          <v-btn
            :loading="switchBtn.loading"
            :disabled="switchBtn.disabled"
            @click="executeSwitch"
            class="selector-btn"
            color="primary"
            tile
            large
          >
            {{ switchBtn.text }}
          </v-btn>
        </div>
        <v-form ref="form" v-model="valid" lazy-validation>
          <div class="selector-container mt-5 mb-3">
            <v-text-field
              v-model="input.email"
              :rules="[rules.required, rules.email]"
              color="secondary"
              label="Email"
              class="mr-3"
              required
            />
            <v-text-field
              v-model="input.password"
              :rules="[rules.required]"
              color="secondary"
              label="Password"
              class="mr-3"
              required
            />
            <v-btn
              :loading="createBtn.loading"
              :disabled="createBtn.disabled"
              @click="createAccountHandler"
              class="selector-btn"
              color="primary"
              tile
              large
            >
              {{ createBtn.text }}
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Credential } from '@/store/serviceCredentials/types';
import { formatTimestamp } from '@/utils/datetime';
import { validateUsers } from '@/services/functions/callofduty';

const serviceCredentials = namespace('serviceCredentials');

type VForm = Vue & { validate: () => boolean };

interface UpdateProps {
  id: string;
  active: boolean;
  updatedAt: Date;
}

@Component({
  name: 'ServiceCredentialsPanel',
})
export default class ServiceCredentialsPanel extends Vue {
  @Ref('form') readonly form!: VForm;
  @Prop() data!: Credential[];

  @serviceCredentials.Action
  public updateServiceCredentials!: (param: UpdateProps) => void;
  @serviceCredentials.Action
  public createServiceCredential!: (param: object) => void;

  private selected = '';
  private status = {
    key: '',
    msg: '',
  };
  private testBtn = {
    text: 'Test Connection',
    loading: false,
    disabled: false,
  };
  private switchBtn = {
    text: 'Switch Account',
    loading: false,
    disabled: false,
  };
  private createBtn = {
    text: 'Create New Account',
    loading: false,
    disabled: false,
  };
  private rules = {
    required: (v: string) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  };
  private valid = true;
  private input = {
    email: '',
    password: '',
  };

  created() {
    const initSelection = this.data.find((d) => d.active);
    if (initSelection) {
      this.selected = initSelection._id;
    }
  }

  get items() {
    return this.data.map((d) => ({
      text: `${d.email}`,
      value: d._id,
    }));
  }

  get selectedData() {
    return this.data.find((d) => d._id === this.selected);
  }

  get lastUpdated() {
    const data = this.selectedData;
    if (data) {
      return formatTimestamp(data.updatedAt);
    }
    return '';
  }

  public async testConnection() {
    try {
      const usernames = [
        {
          platform: 'xbl',
          username: 'benchod94',
        },
      ];
      this.testBtn.loading = true;
      this.switchBtn.disabled = true;

      const errors = await validateUsers({ usernames });
      if (errors.length > 0) {
        this.status.key = 'failed';
        this.status.msg = `id ${usernames[0].username} is invalid`;
      } else {
        this.status.key = 'pass';
        this.status.msg = 'Passed!';
      }

      this.testBtn.loading = false;
      this.switchBtn.disabled = false;
    } catch (err) {
      this.handleError(err);
    }
  }

  public async executeSwitch() {
    try {
      this.testBtn.disabled = true;
      this.switchBtn.loading = true;

      const selected = this.selectedData;
      if (selected && !selected.active) {
        await this.activateAccount(selected);
        await this.deactivateOtherAccounts(selected);
        this.status.key = 'pass';
        this.status.msg = 'Successfully switched!';
      } else {
        this.status.key = 'info';
        this.status.msg = 'This account is already activated';
      }

      this.testBtn.disabled = false;
      this.switchBtn.loading = false;
    } catch (err) {
      this.handleError(err);
    }
  }

  public async createAccountHandler() {
    try {
      this.valid = this.form ? this.form.validate() : false;
      if (this.valid) {
        this.createBtn.loading = true;

        await this.createAccount();
        this.status.key = 'info';
        this.status.msg = 'Created a new service account';

        this.createBtn.loading = false;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  public async activateAccount(selected: Credential) {
    await this.updateServiceCredentials({
      id: selected._id,
      active: true,
      updatedAt: new Date(),
    });
  }

  public async deactivateOtherAccounts(selected: Credential) {
    this.data
      .filter((d) => d._id !== selected._id)
      .forEach(async (d) => {
        await this.updateServiceCredentials({
          id: d._id,
          active: false,
          updatedAt: new Date(),
        });
      });
  }

  public async createAccount() {
    return this.createServiceCredential({
      group: 'wz-callofduty',
      email: this.input.email,
      password: this.input.password,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(err: any) {
    console.error(err);
    this.status.key = 'failed';
    this.status.msg = err.message || err;
    this.testBtn.disabled = false;
    this.switchBtn.loading = false;
    this.createBtn.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.panel-container {
  border-radius: 4px !important;
  margin-top: 12px;

  .panel-header {
    display: flex;
    position: relative;
    padding: 0 24px 24px 24px;

    .panel-title-container {
      position: absolute;
      left: 48px;
      top: -24px;
      min-width: 120px;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 18px;
      color: white;
    }
  }

  .content-container {
    padding: 24px;
    text-align: left;

    .main-title {
      font-size: 24px;
      margin-top: 12px;
    }

    .selector-container {
      display: flex;
      align-items: center;
    }

    .selector {
      display: flex;
      align-items: center;
      margin-top: 30px;
      max-width: 300px;
    }

    .selector-btn {
      margin-right: 24px;
    }
  }
}
</style>
