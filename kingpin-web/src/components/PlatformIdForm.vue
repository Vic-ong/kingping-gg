<template>
  <v-card>
    <v-toolbar class="title-font font-l d-flex justify-center primary" dark>
      <span>Action Required!</span>
    </v-toolbar>
    <div class="py-5 px-10 font-s">
      <div v-if="!hideInfo" class="text-left py-5"><b>Note: </b>{{ actionDesc }}</div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="inputPlatform"
              label="Choose a platform"
              :items="items"
              :rules="[required]"
              validate-on-blur
              required
              filled
            ></v-select>
            <v-text-field
              v-model="inputId"
              label="Username/ID registered to the platform"
              :rules="[required]"
              validate-on-blur
              required
              filled
            ></v-text-field>
            <v-text-field
              v-model="inputActivisionId"
              label="Activision ID"
              :rules="[required]"
              validate-on-blur
              required
              filled
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
      <div v-if="errors" class="error--text">{{ errors }}</div>
      <v-card-actions class="justify-center">
        <v-btn @click="submitHandler" :loading="loading" color="secondary">Submit</v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Ref, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { User } from '@/store/profile/types';
import { validateUsers } from '@/services/functions/callofduty';

const profile = namespace('profile');

type VForm = Vue & { validate: () => boolean };

interface UpdateUserProps {
  id: string;
  activisionId?: string;
  platformId: {
    platform: string;
    username: string;
  };
  updatedAt: Date;
}

@Component({
  name: 'mainHeader',
})
export default class SignUpForm extends Vue {
  @Ref('form') readonly form!: VForm;
  @Prop() data!: User;
  @Prop() hideInfo!: boolean;

  @profile.Action
  public updateUser!: (param: UpdateUserProps) => void;

  private valid = true;
  private loading = false;
  private required = (v: string) => !!v || 'This field is required';
  private actionDesc =
    'Due to the recent change in the Call of Duty API requirements, you will have to provide a platform username in addition to the acitivision ID to use Kingpin.';

  private inputPlatform = '';
  private inputId = '';
  private inputActivisionId = '';
  private items = [
    { text: 'Playstation', value: 'psn' },
    { text: 'XBox', value: 'xbl' },
    { text: 'Steam', value: 'steam' },
    { text: 'Battlenet', value: 'battle' },
  ];
  private errors = '';

  mounted() {
    const { platformId, activisionId } = this.data;

    this.inputActivisionId = activisionId;

    if (platformId) {
      this.inputPlatform = platformId.platform;
      this.inputId = platformId.username;
    }
  }

  get usernames() {
    return [
      {
        platform: this.inputPlatform,
        username: this.inputId,
      },
    ];
  }

  public async validate() {
    this.valid = this.form.validate();
    if (this.valid) {
      const errors = await validateUsers({ usernames: this.usernames });
      this.valid = errors.length === 0;

      if (errors.length > 0) this.errors = 'Invalid platform ID';
    }
  }
  public async submitHandler() {
    try {
      this.errors = '';
      this.loading = true;
      await this.validate();
      if (this.valid) {
        await this.updateUser({
          id: this.data._id,
          activisionId: this.inputActivisionId,
          platformId: {
            platform: this.inputPlatform,
            username: this.inputId,
          },
          updatedAt: new Date(),
        });
      }
      this.$emit('updated');
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.errors = err.message || err;
      this.$emit('error', err);
    }
  }
}
</script>
