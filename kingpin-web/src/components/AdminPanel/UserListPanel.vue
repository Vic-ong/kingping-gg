<template>
  <div>
    <v-card class="panel-container elevation-5" style="margin-top: 48px;">
      <div class="panel-header">
        <div class="title-font panel-title-container secondary elevation-5">Users</div>
        <v-spacer />
        <v-btn @click="payoutDialog = true" color="primary" class="mt-3 mr-12" tile large>
          <v-icon small class="mr-2">fa-dollar-sign</v-icon>
          Payout
        </v-btn>
        <v-text-field
          v-model="search"
          append-icon="fa-search"
          label="Search"
          style="max-width: 400px;"
          single-line
          hide-details
        ></v-text-field>
      </div>
      <v-data-table class="data-table" :options="tableOpts" :headers="headers" :items="tableData" :search="search">
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="d in items" :key="d._id">
              <td v-for="header in headers" v-bind:key="header.value" style="text-align: left;">
                <div v-if="header.editable" style="cursor: pointer;" @click="onEditClick(d)">
                  {{ d[header.value] }}
                </div>
                <div v-else>{{ d[header.value] }}</div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="400">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="popup-container">
          <div class="title-font popup-title">Edit User</div>
          <v-text-field v-model="editObject.activisionId" label="Activision ID" :rules="[rules.required]" required />
          <v-text-field
            v-model="editObject.currentBalance"
            label="Balance"
            prefix="$"
            :rules="[rules.required, rules.isCurrency]"
            required
          />
          <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
          <v-btn :loading="loading" @click="onConfirmEdit" color="secondary" class="main-btn popup-btn" tile large>
            Confirm
          </v-btn>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="payoutDialog" max-width="400">
      <v-form ref="formPayout" v-model="validPayout" lazy-validation>
        <v-card class="popup-container">
          <div class="title-font popup-title">Payout to User</div>
          <v-select
            v-model="payoutObject.user"
            label="User (Current Balance)"
            :items="userList"
            :rules="[rules.required]"
            required
          />
          <v-text-field
            v-model="payoutObject.amount"
            label="Amount to Withdraw"
            prefix="$"
            :rules="[rules.required, rules.isCurrency]"
            required
          />
          <div v-bind:class="[status.classStyle]">{{ status.message }}</div>
          <v-btn :loading="loading" @click="onConfirmPayout" color="secondary" class="main-btn popup-btn" tile large>
            Confirm
          </v-btn>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import format from 'date-fns/format';
import { Vue, Component, Prop, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { CurrencyProps } from '@/store/types';
import { NewTransactionProps } from '@/store/ledger/types';
import { User } from '@/store/profile/types';
import Currency, { splitCurrency } from '@/utils/currency';

const profile = namespace('profile');
const ledger = namespace('ledger');

type VForm = Vue & { validate: () => boolean };

interface EditObject {
  _id: string;
  activisionId: string;
  currentBalance: string;
}

interface UpdateProps {
  id: string;
  activisionId?: string;
  currentBalance: CurrencyProps;
  updatedAt: Date;
}

@Component({
  name: 'UserListPanel',
})
export default class UserListPanel extends Vue {
  @Ref('form') readonly form!: VForm;
  @Ref('formPayout') readonly formPayout!: VForm;
  @Prop() data!: User;

  @profile.Action
  public updateUserList!: (param: UpdateProps) => void;
  @ledger.Action
  public createTransaction!: (newTransaction: NewTransactionProps) => void;

  private tableOpts = {
    itemsPerPage: 10,
    sortBy: ['updatedAt'],
    sortDesc: [true],
    mustSort: true,
  };
  private headers = [
    {
      text: 'ID',
      value: '_id',
    },
    {
      text: 'Name',
      value: 'name',
    },
    {
      text: 'Email',
      value: 'email',
    },
    {
      text: 'Activision ID',
      value: 'activisionId',
      editable: true,
    },
    {
      text: 'Balance ($)',
      value: 'currentBalance',
      editable: true,
    },
    {
      text: 'Last Updated',
      value: 'updatedAt',
    },
  ];
  private search = '';
  private valid = true;
  private loading = false;
  // edit dialog
  private editDialog = false;
  private editObject: EditObject = {
    _id: '',
    activisionId: '',
    currentBalance: '',
  };
  // payout dialog
  private validPayout = true;
  private payoutDialog = false;
  private payoutObject = {
    amount: 0,
    user: '',
  };
  private status = {
    classStyle: '',
    message: '',
  };
  private rules = {
    required: (v: string) => !!v || 'This field is required',
    isCurrency: (v: string) => this.isValidCurrency(v) || 'Invalid currency',
  };

  get tableData() {
    if (this.data && this.data instanceof Array) {
      return this.data.map((d: User) => ({
        _id: d._id,
        name: `${d.firstName} ${d.lastName}`,
        email: d.email,
        activisionId: d.activisionId,
        currentBalance: new Currency(d.currentBalance).objToCurrencyNum(),
        updatedAt: this.formatTimestamp(d.updatedAt),
      }));
    }
    return [];
  }

  get userList() {
    if (this.data && this.data instanceof Array) {
      return this.data.map((d: User) => ({
        text: `${d.firstName} ${d.lastName} ($${new Currency(d.currentBalance).objToCurrencyNum()})`,
        value: d._id,
      }));
    }
    return [];
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  public formatTimestamp(dt: any) {
    return format(new Date(dt.seconds * 1000), 'MM/dd HH:mm');
  }

  public isValidCurrency(v: string) {
    if (Number.isNaN(Number(v))) return false;
    if (Number(v) === 0) return true;
    const regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
    return regex.test(v);
  }

  public onEditClick(obj: EditObject) {
    this.editDialog = true;
    this.editObject = { ...obj };
  }

  public async onConfirmEdit() {
    this.valid = this.form ? this.form.validate() : false;
    if (this.valid) {
      try {
        this.loading = true;
        this.status = {
          classStyle: 'info--text',
          message: 'Updating information',
        };
        const [dollars, cents] = splitCurrency(parseFloat(this.editObject.currentBalance));
        await this.updateUserList({
          id: this.editObject._id,
          activisionId: this.editObject.activisionId,
          currentBalance: {
            currency: 'USD',
            dollars,
            cents,
          },
          updatedAt: new Date(),
        });
        this.status = {
          classStyle: '',
          message: '',
        };
        this.editDialog = false;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        console.error(err);
      }
    }
  }

  public async onConfirmPayout() {
    this.validPayout = this.formPayout ? this.formPayout.validate() : false;
    if (this.validPayout && this.data && this.data instanceof Array) {
      try {
        this.loading = true;
        const { amount, user: userId } = this.payoutObject;
        const user = this.data.find((userRecord) => userRecord._id === userId);
        const balance = new Currency(user.currentBalance);
        const newBalance = balance.subtract(Number(amount));
        const newDate = new Date();

        const newTransaction = {
          amount: -Number(amount),
          description: 'withdraw',
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            previousBalance: user.currentBalance,
            currentBalance: newBalance,
          },
          createdAt: newDate,
          updatedAt: newDate,
        };

        const updateUser = {
          id: user._id,
          currentBalance: newBalance,
          updatedAt: newDate,
        };

        await this.createTransaction(newTransaction);
        await this.updateUserList(updateUser);

        this.loading = false;
        this.payoutDialog = false;
      } catch (err) {
        this.loading = false;
        console.error(err);
      }
    }
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
}

.data-table {
  overflow-x: scroll;
}

.popup-container {
  padding: 36px 24px 24px 24px;

  .popup-title {
    font-size: 24px;
    padding-bottom: 12px;
  }
}
</style>
