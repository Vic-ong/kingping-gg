<template>
  <div class="main-container">
    <v-card tile flat class="card-container transparent">
      <div class="title-font card-title">Playing in a party?</div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <p class="mt-4">Please enter your party members' <b>Activision IDs</b><br />.</p>
        <div v-for="n in teammateSize" v-bind:key="n">
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="input[n - 1]"
                :label="`Teammate ${n}`"
                :rules="[rules.required]"
                prepend-icon="fa-user"
                validate-on-blur
                required
                dense
              />
            </v-col>
            <!-- <v-col cols="12" md="4">
              <v-checkbox v-model="inputChecks[n - 1]" label="Randomized" class="shrink mt-0 disable-events" readonly />
            </v-col> -->
          </v-row>
        </div>
      </v-form>
      <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
      <v-btn :loading="loading" @click="selectTeam" color="secondary" class="main-btn mt-3" tile large> Proceed </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { UserState } from '@/store/profile/types';
// import { validateUsers } from '@/services/functions/callofduty';

type VForm = Vue & { validate: () => boolean };

const profile = namespace('profile');

interface ParamsProps {
  mode: string;
  team: string[];
  amount: string;
  wager: string;
  [key: string]: string | string[];
}

interface TeamSizeProps {
  br_brsolo: number;
  br_brduos: number;
  br_brtrios: number;
  br_brquads: number;
  [key: string]: number;
}

@Component({
  name: 'mainFooter',
})
export default class SignUpForm extends Vue {
  @Ref('form') readonly form!: VForm;
  @Prop() params!: ParamsProps;

  @profile.Getter
  public userProfile!: UserState;

  mounted() {
    if (this.params.mode === 'br_brsolo')
      this.$emit('next', {
        param: 'partyIds',
        value: [],
      });
  }

  private valid = true;
  private rules = {
    required: (v: string) => !!v || 'This field is required',
  };
  private loading = false;
  private status = {
    classStyle: '',
    message: '',
  };
  private input = ['', '', ''];
  /* eslint-disable @typescript-eslint/camelcase */
  private teammateSizeKeys: TeamSizeProps = {
    br_brsolo: 0,
    br_brduos: 1,
    br_brtrios: 2,
    br_brquads: 3,
  };

  // get inputChecks(): boolean[] {
  //   return this.input.map((x) => !x);
  // }

  get teammateSize(): number {
    return this.teammateSizeKeys[this.params.mode] || 0;
  }

  public async selectTeam() {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading = true;
        const partyIds = this.input.slice(0, this.teammateSize).filter((x) => x);
        const isUnique = this.isUnique(partyIds);
        if (isUnique) {
          // const errors = await this.validateUser(partyIds);
          const errors = await this.validateUser();
          if (errors.length === 0) {
            this.loading = false;
            this.$emit('next', {
              param: 'partyIds',
              value: partyIds,
            });
          } else {
            this.setError(`Invalid Activision IDs: ${errors.join(', ')}`);
          }
        } else {
          this.setError('Detected duplicated IDs');
        }
      } catch (err) {
        this.setError(err.message);
      }
    }
  }

  public setError(statusMsg: string) {
    this.loading = false;
    this.status = {
      classStyle: 'error--text',
      message: statusMsg,
    };
  }

  public isUnique(list: string[]) {
    if (!this.userProfile.data) {
      return false;
    }
    const test = [...list, this.userProfile.data.activisionId];
    return new Set(test).size === test.length;
  }

  // public async validateUser(partyIds: string[]): Promise<string[]> {
  //   this.status = {
  //     classStyle: 'info--text',
  //     message: 'Validating...',
  //   };
  //   if (!this.userProfile.data) return ['No user data'];
  //   const errors = await validateUsers({
  //     activisionId: this.userProfile.data.activisionId,
  //     partyIds,
  //   });
  //   return errors;
  // }
  public async validateUser(): Promise<string[]> {
    return [];
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  .card-container {
    width: 400px;

    .card-title {
      font-size: 32px;
    }

    .main-btn {
      min-width: 120px;
    }
  }
}

.disable-events {
  pointer-events: none;
}
</style>
