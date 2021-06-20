<template>
  <PageContainer>
    <div class="profile-container">
      <div class="card-wrapper">
        <v-card tile class="profile-card elevation-7">
          <div class="title-font name">User Profile</div>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="user.firstName" label="First Name" outlined readonly />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="user.lastName" label="Last Name" outlined readonly />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="user.state" label="State" outlined readonly />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="user.dob" label="Date of birth" outlined readonly />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="9">
                <v-text-field v-model="user.activisionId" label="Acitvision ID" outlined readonly />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn @click="editActivisionId" color="secondary" class="mt-1" tile large> Edit </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6" md="4">
                <v-text-field v-model="platformName" label="Platform" outlined readonly />
              </v-col>
              <v-col cols="6" md="5">
                <v-text-field v-model="platformUsername" label="Platform username" outlined readonly />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn @click="editPlatform" color="secondary" class="mt-1" tile large> Edit </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <div class="title-font name mt-5">Security</div>
          <v-form ref="form">
            <v-text-field v-model="user.email" label="Email" outlined readonly />
            <p class="info--text status-message">{{ securityStatus }}</p>
            <v-btn @click="dialog2 = true" color="secondary" class="ma-2" tile large> Change Email </v-btn>
            <v-btn @click="resetPasswordHandler" color="secondary" class="ma-2" tile large> Reset Password </v-btn>
          </v-form>
        </v-card>
      </div>

      <v-dialog v-model="dialog" max-width="330">
        <v-card class="dialog-card">
          <p class="dialog-title title-font">Update Profile</p>
          <v-text-field v-model="input.value" :label="input.label" dense></v-text-field>

          <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
          <v-btn
            :disabled="!input.value"
            :loading="loading"
            @click="updateProfileHandler"
            color="secondary"
            class="mt-3"
            tile
            large
          >
            Update
          </v-btn>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog2" max-width="330">
        <v-card class="dialog-card">
          <v-form ref="form" v-model="valid" lazy-validation>
            <p class="dialog-title title-font">Please Log In Again</p>
            <v-text-field
              v-model="input.email.value"
              :label="input.email.label"
              :rules="[rules.email]"
              prepend-icon="fa-envelope"
              validate-on-blur
              required
              dense
            ></v-text-field>
            <v-text-field
              v-model="input.password.value"
              :label="input.password.label"
              :append-icon="showPassword ? 'fa-eye' : 'fa-eye-slash'"
              :type="showPassword ? 'text' : 'password'"
              @click:append="showPassword = !showPassword"
              prepend-icon="fa-lock"
              required
            ></v-text-field>

            <v-btn :loading="loading2" @click="reauthHandler" color="secondary" class="mt-3" tile large> Log In </v-btn>
          </v-form>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog3" max-width="400">
        <PlatformIdForm :data="userProfile.data" :hideInfo="true"></PlatformIdForm>
      </v-dialog>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Component, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { UserState } from '@/store/profile/types';
// import { validateUsers } from '@/services/functions/callofduty';
import PlatformIdForm from '@/components/PlatformIdForm.vue';
import PageContainer from '@/components/layouts/PageContainer.vue';

type VForm = Vue & { validate: () => boolean };

const profile = namespace('profile');

interface UpdateUserProps {
  id: string;
  activisionId?: string;
  email?: string;
  updatedAt: Date;
}

@Component({
  name: 'UserProfile',
  components: {
    PageContainer,
    PlatformIdForm,
  },
})
export default class Home extends Vue {
  @Ref('form') readonly form!: VForm;

  @profile.Action
  public updateUser!: (param: UpdateUserProps) => void;

  @profile.Getter
  public userProfile!: UserState;

  private valid = true;
  private dialog = false;
  private status = {
    classStyle: '',
    message: '',
  };
  private dialog2 = false;
  private dialog3 = false;
  private loading = false;
  private loading2 = false;
  private showPassword = false;
  private securityStatus = '';
  private rules = {
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  };
  private input = {
    value: '',
    label: '',
    email: {
      value: '',
      label: 'Email',
    },
    password: {
      value: '',
      label: 'Password',
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get user(): any {
    return this.userProfile.data || {};
  }
  get platformName() {
    return this._.get(this.userProfile, 'data.platformId.platform');
  }
  get platformUsername() {
    return this._.get(this.userProfile, 'data.platformId.username');
  }

  public editActivisionId() {
    this.dialog = true;
    this.input.label = 'Update Activision ID';
    this.input.value = this.user.activisionId;
  }
  public editPlatform() {
    this.dialog3 = true;
  }
  public editEmail() {
    this.dialog = true;
    this.input.label = 'Enter New Email';
    this.input.value = this.user.email;
  }
  public updateProfileHandler() {
    if (this.input.label === 'Enter New Email') {
      this.updateEmailHandler();
    } else {
      this.updateInfoHandler();
    }
  }
  public async updateInfoHandler() {
    try {
      this.loading = true;
      // const validId = await this.validateUser();
      // if (validId && this.userProfile.data) {
      if (this.userProfile.data) {
        await this.updateUser({
          id: this.userProfile.data._id,
          activisionId: this.input.value,
          updatedAt: new Date(),
        });
        this.loading = false;
        this.dialog = false;
      } else {
        this.loading = false;
        this.status = {
          classStyle: 'error--text',
          message: 'Please enter a valid Activision ID',
        };
      }
    } catch (err) {
      this.loading = false;
      console.error(err);
    }
  }

  public async validateUser() {
    // this.status = {
    //   classStyle: 'info--text',
    //   message: 'Validating...',
    // };
    // const errors = await validateUsers({ activisionId: this.input.value });
    // return errors.length === 0;
    return true;
  }

  public async resetPasswordHandler(): Promise<void> {
    if (this.userProfile.data) {
      try {
        this.loading2 = true;
        await this.sendResetPasswordEmail();
        this.loading2 = false;
        this.dialog2 = false;
        this.securityStatus = 'We sent a password reset link to you! Please check your inbox.';
      } catch (err) {
        this.loading2 = false;
        this.dialog2 = false;
        this.securityStatus = 'We sent a password reset link to you! Please check your inbox.';
      }
    }
  }

  public async reauthHandler(): Promise<void> {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading2 = true;
        await this.reauth();
        this.loading2 = false;
        this.dialog2 = false;
        this.editEmail();
      } catch (err) {
        this.loading2 = false;
        this.dialog2 = false;
        this.securityStatus = 'Email or password is invalid.';
      }
    }
  }

  public async updateEmailHandler(): Promise<void> {
    if (this.userProfile.data) {
      try {
        this.loading = true;
        await this.updateEmail();
        await this.updateUser({
          id: this.userProfile.data._id,
          email: this.input.value,
          updatedAt: new Date(),
        });
        this.loading = false;
        this.dialog = false;
        this.securityStatus = 'Your email is updated!';
      } catch (err) {
        console.error(err);
        this.loading = false;
        this.dialog = false;
        this.securityStatus = 'Your email is updated!';
      }
    }
  }

  public sendResetPasswordEmail() {
    return firebase.auth().sendPasswordResetEmail(this.user.email);
  }

  public async reauth() {
    const user = firebase.auth().currentUser;
    if (user) {
      const credential = await firebase.auth.EmailAuthProvider.credential(
        this.input.email.value,
        this.input.password.value,
      );
      return user.reauthenticateWithCredential(credential);
    }
    return new Promise((reject) => reject('user is null'));
  }

  public updateEmail() {
    const user = firebase.auth().currentUser;
    if (user) return user.updateEmail(this.input.value);
    return new Promise((reject) => reject('user is null'));
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 32px 0;

  .card-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: center;

    .profile-card {
      padding: 32px;
      max-width: 600px;

      .name {
        font-size: 36px;
      }
    }
  }
}

.dialog-card {
  padding: 30px;

  .dialog-title {
    font-size: 24px;
  }
}
</style>
