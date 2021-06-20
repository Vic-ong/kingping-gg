<template>
  <v-card tile :style="formStyles" class="form-card elevation-7">
    <v-form ref="form" v-model="valid" lazy-validation>
      <p class="form-title title-font">Sign Up</p>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="inputValues.firstName"
            :label="input.firstName.label"
            :counter="len.name"
            :rules="[rules.required, rules.name]"
            :prepend-icon="isXS ? '' : 'fa-user-circle'"
            required
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="inputValues.lastName"
            :label="input.lastName.label"
            :counter="len.name"
            :rules="[rules.required, rules.name]"
            required
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="inputValues.password"
            :label="input.password.label"
            :type="showPassword ? 'text' : 'password'"
            :rules="[rules.required, rules.pass]"
            :prepend-icon="isXS ? '' : 'fa-lock'"
            :dense="isXS"
            validate-on-blur
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="inputValues.password2"
            :label="input.password2.label"
            :append-icon="showPassword ? 'fa-eye' : 'fa-eye-slash'"
            :type="showPassword ? 'text' : 'password'"
            :rules="[rules.required, rules.pass2]"
            :dense="isXS"
            @click:append="showPassword = !showPassword"
            validate-on-blur
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="inputValues.email"
            :label="input.email.label"
            :rules="[rules.required, rules.email]"
            :prepend-icon="isXS ? '' : 'fa-envelope'"
            validate-on-blur
            required
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="inputValues.state"
            :label="input.state.label"
            :items="input.state.items"
            :rules="[rules.required]"
            required
            dense
          ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-text-field
            v-model="inputValues.activisionId"
            :label="input.activisionId.label"
            :rules="[rules.required]"
            :prepend-icon="isXS ? '' : 'fa-gamepad'"
            required
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <template>
            <v-menu
              ref="pickerMenu"
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="inputValues.dob"
                  :label="input.dob.label"
                  :rules="[rules.required]"
                  v-on="on"
                  readonly
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                no-title
                ref="picker"
                v-model="inputValues.dob"
                :max="input.dob.max"
                :min="input.dob.min"
                @change="saveDate"
              ></v-date-picker>
            </v-menu>
          </template>
        </v-col>
      </v-row>

      <v-checkbox v-model="agreeTermsValue" :rules="[rules.checkbox]" required>
        <div slot="label">
          I have read and agree to all of the following terms and conditions below
        </div>
      </v-checkbox>
      <div class="terms-text mb-2">
        <div>1. I agree that checking this box confirms that <b>I am above 21 years old.</b></div>
        <div>
          2. I agree that I have read the terms and betting rules
          <router-link to="/faq" target="_blank">
            <span class="secondary--text">in the FAQ</span>
          </router-link>
        </div>
      </div>

      <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
      <v-btn :loading="loading" @click="submitFormHandler" color="secondary" class="mt-3" tile large> Sign Up </v-btn>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Vue, Prop, Component, Ref, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import stateList from '@/constants/states';
// import { validateUsers } from '@/services/functions/callofduty';
import { sendSlackMsg } from '@/services/functions/slack';

type VForm = Vue & { validate: () => boolean };
type SavePicker = Vue & { save: (date: string) => void };
type ActivePicker = Vue & { activePicker: string };

const profile = namespace('profile');

@Component({
  name: 'signUpForm',
})
export default class SignUpForm extends Vue {
  @Prop({ default: 'none', type: String }) readonly formHeight!: string;
  @Ref('form') readonly form!: VForm;
  @Ref('pickerMenu') readonly pickerMenu!: SavePicker;
  @Ref('picker') picker!: ActivePicker;

  @profile.Action
  public createUser!: (newUser: object) => void;

  @Watch('menu')
  nameChanged(val: string) {
    val &&
      setTimeout((): void => {
        this.picker.activePicker = 'YEAR';
      });
  }

  // Form attributes
  private valid = true;
  private loading = false;
  private showPassword = false;
  private menu = false;
  private status = {
    classStyle: '',
    message: '',
  };
  private agreeTermsValue = false;
  private input = {
    firstName: {
      label: 'First name',
    },
    lastName: {
      label: 'Last name',
    },
    password: {
      label: 'Password',
    },
    password2: {
      label: 'Retype password',
    },
    email: {
      label: 'Email',
    },
    activisionId: {
      label: 'Activision ID',
    },
    state: {
      label: 'State',
      items: stateList,
    },
    dob: {
      label: 'Date of birth',
      max: new Date(new Date().getTime() - 21 * 365 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
      min: '1950-01-01',
    },
  };
  private inputValues = {
    firstName: '',
    lastName: '',
    password: '',
    password2: '',
    email: '',
    activisionId: '',
    state: '',
    dob: '',
  };

  // Form rules
  private len = {
    name: 15,
    pass: 8,
  };
  private rules = {
    required: (v: string) => !!v || 'This field is required',
    name: (v: string) => v.length <= this.len.name || `Name must be less than ${this.len.name} characters`,
    pass: (v: string) => v.length >= this.len.pass || `Password must be more than ${this.len.pass} characters`,
    pass2: (v: string) => v === this.inputValues.password || 'Password does not match',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    checkbox: (v: string) => !!v || 'You must agree to continue!',
  };

  get isXS() {
    return this.$vuetify.breakpoint.xs;
  }

  get formStyles(): object {
    return {
      '--height': this.isXS ? 'unset' : this.formHeight,
    };
  }

  public saveDate(date: string): void {
    this.pickerMenu.save(date);
  }

  public async submitFormHandler(): Promise<void> {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading = true;
        // validate the user's activision ID
        const validId = await this.validateUser();
        if (validId) {
          // create a user account and add a user doc to the db
          const res = await this.createAccount();
          const authId = res.user && res.user.uid;
          if (authId) {
            await this.createUserProfile(authId);
            this.login();
            this.$router.replace({ name: 'wager' });
          }
          this.loading = false;
        } else {
          this.loading = false;
          this.status = {
            classStyle: 'error--text',
            message: 'Please make sure your activision privacy settings are set to public',
          };
        }
      } catch (err) {
        this.loading = false;
        this.status = {
          classStyle: 'error--text',
          message: err.message,
        };
        sendSlackMsg(err.message || err, 'SignUpForm');
      }
    }
  }

  public async validateUser() {
    // this.status = {
    //   classStyle: 'info--text',
    //   message: 'Validating...',
    // };
    // const errors = await validateUsers({ activisionId: this.inputValues.activisionId });
    // return errors.length === 0;
    return true;
  }

  public createAccount() {
    this.status = {
      classStyle: 'info--text',
      message: 'Creating your account...',
    };
    return firebase.auth().createUserWithEmailAndPassword(this.inputValues.email, this.inputValues.password);
  }

  public login() {
    return firebase.auth().signInWithEmailAndPassword(this.inputValues.email, this.inputValues.password);
  }

  public createUserProfile(_id: string) {
    const userProfile = {
      _id,
      active: true,
      firstName: this.inputValues.firstName,
      lastName: this.inputValues.lastName,
      email: this.inputValues.email,
      activisionId: this.inputValues.activisionId,
      state: this.inputValues.state,
      dob: this.inputValues.dob,
      currentBalance: {
        currency: 'USD',
        dollars: 0,
        cents: 0,
      },
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.createUser(userProfile);
  }
}
</script>

<style lang="scss" scoped>
.form-card {
  padding: 28px;
  height: var(--height);

  .form-title {
    font-size: 36px;
    margin-bottom: 24px;
  }
}
.terms-text {
  font-size: 12px;
  text-align: left;
}
</style>
