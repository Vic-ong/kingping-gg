<template>
  <div class="form-wrapper">
    <v-card tile :style="formStyles" class="form-card elevation-7">
      <v-form ref="form" v-model="valid" lazy-validation>
        <p class="form-title title-font">Welcome to kingpin</p>
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

        <span class="red--text status-message">{{ error }}</span>
        <span class="info--text status-message">{{ resetEmailStatus }}</span>

        <p class="grey--text forgot-password" @click="dialog = true">Forgot password?</p>

        <v-btn :loading="loading" @click="submitFormHandler" color="secondary" class="mt-3" tile large> Log In </v-btn>
      </v-form>
    </v-card>
    <v-dialog v-model="dialog" max-width="330">
      <v-card class="dialog-card">
        <p class="dialog-title title-font">Forgot Password</p>
        <v-card-text> Please insert the email you used to register your account </v-card-text>
        <v-text-field
          v-model="input.email.value"
          :label="input.email.label"
          :rules="[rules.email]"
          prepend-icon="fa-envelope"
          validate-on-blur
          required
          dense
        ></v-text-field>

        <v-btn :loading="loading2" @click="resetPasswordHandler" color="secondary" class="mt-3" tile large>
          Reset Password
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Prop, Component, Ref } from 'vue-property-decorator';

type VForm = Vue & { validate: () => boolean };

@Component({
  name: 'logInForm',
})
export default class LogInForm extends Vue {
  @Prop({ default: 'none', type: String }) readonly formHeight!: string;
  @Ref('form') readonly form!: VForm;

  // Form attributes
  private valid = true;
  private dialog = false;
  private loading = false;
  private loading2 = false;
  private showPassword = false;
  private error = '';
  private resetEmailStatus = '';
  private input = {
    email: {
      value: '',
      label: 'Email',
    },
    password: {
      value: '',
      label: 'Password',
    },
  };

  private rules = {
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  };

  get formStyles(): object {
    return {
      '--height': this.formHeight,
    };
  }

  public async submitFormHandler(): Promise<void> {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading = true;
        await this.login();
        this.$router.replace({ name: 'wager' });
      } catch (err) {
        this.loading = false;
        this.error = 'Email or password is invalid.';
      }
    }
  }

  public async resetPasswordHandler(): Promise<void> {
    if (this.rules.email(this.input.email.value) === true) {
      try {
        this.loading2 = true;
        await this.sendResetPasswordEmail();
        this.loading2 = false;
        this.dialog = false;
        this.resetEmailStatus = 'We sent a password reset link to you! Please check your inbox.';
      } catch (err) {
        this.loading2 = false;
        this.dialog = false;
        this.resetEmailStatus = 'We sent a password reset link to you! Please check your inbox.';
      }
    }
  }

  public login() {
    return firebase.auth().signInWithEmailAndPassword(this.input.email.value, this.input.password.value);
  }

  public sendResetPasswordEmail() {
    return firebase.auth().sendPasswordResetEmail(this.input.email.value);
  }
}
</script>

<style lang="scss" scoped>
.form-wrapper {
  .form-card {
    padding: 30px 60px;
    height: var(--height);

    .form-title {
      font-size: 36px;
      margin-bottom: 60px;
    }

    .status-message {
      display: block;
    }
  }

  .forgot-password {
    cursor: pointer;
  }
}

.dialog-card {
  padding: 30px;

  .dialog-title {
    font-size: 24px;
  }
}
</style>
