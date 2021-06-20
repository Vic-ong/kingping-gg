<template>
  <PageContainer>
    <div class="content-container pa-5">
      <!-- data error -->
      <div v-if="error || this.userProfile.error">
        <v-card tile flat class="status-container transparent">
          <v-icon class="ma-3" color="error" x-large>fa-exclamation-triangle</v-icon>
          <div class="title-font">Ops! We encountered an internal error 😰</div>
          <div class="title-font">Please contact our team for support</div>
        </v-card>
      </div>
      <!-- data loading -->
      <div v-else-if="this.userProfile.loading">
        <div class="status-container">
          <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
          <div class="title-font">Loading...</div>
        </div>
      </div>

      <div v-else-if="!paid">
        <div class="title-font main-title mb-5">Deposit Funds</div>
        <div v-if="!loading">
          <p>How much would you like to deposit?</p>
          <div class="selection-container">
            <div
              v-for="(item, i) in amountSelections"
              v-bind:key="item.amount"
              @click="setAmount(item, i)"
              :class="item.active && amount === item.amount ? 'primary white--text' : 'grey lighten-3'"
              class="title-font amount-selection"
              large
            >
              <div v-if="item.popular" class="banner secondary">Popular</div>
              $ {{ item.amount }}
            </div>
          </div>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="amount"
              label="Amount"
              prefix="$"
              :rules="[rules.required, rules.isCurrency]"
              type="number"
              autocomplete="off"
              autofocus
              required
            />
          </v-form>
        </div>
        <div v-else>
          <div class="status-container">
            <v-progress-circular class="mb-5" size="55" width="6" color="secondary" indeterminate />
            <div class="title-font mb-5">Processing Payment...</div>
          </div>
        </div>
        <div class="payment-button">
          <transition name="slide-fade">
            <PaypalButton
              v-show="valid"
              :payer="payer"
              :orders="orders"
              @onLoading="handleLoading"
              @onPaid="handlePaid"
              @onError="handleError"
            />
          </transition>
        </div>
      </div>

      <div v-else-if="paid">
        <div class="success-container">
          <div class="title-font main-title">Successfully added</div>
          <div class="title-font main-title secondary--text">$ {{ this.amount }}</div>
          <div class="title-font main-title">to your account!</div>
          <v-btn @click="$router.push({ name: 'wager' })" color="secondary" class="mt-5" tile large>
            Place a bet
          </v-btn>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { CurrencyProps } from '@/store/types';
import { UserState } from '@/store/profile/types';
import { NewTransactionProps } from '@/store/ledger/types';
import Currency from '@/utils/currency';
import PageContainer from '@/components/layouts/PageContainer.vue';
import PaypalButton from '@/components/Transactions/PaypalButton.vue';

type VForm = Vue & { validate: () => boolean };

interface PaymentLinkProps {
  href: string;
  method: string;
}
interface OrderResponseProps {
  create_time: string;
  update_time: string;
  id: string;
  intent: string;
  links: PaymentLinkProps[];
}

interface UpdateUserProps {
  id: string;
  currentBalance: CurrencyProps;
  updatedAt: Date;
}

const profile = namespace('profile');
const ledger = namespace('ledger');

@Component({
  name: 'Deposit',
  components: {
    PageContainer,
    PaypalButton,
  },
})
export default class Deposit extends Vue {
  @Ref('form') readonly form!: VForm;

  @profile.Getter
  public userProfile!: UserState;
  @profile.Action
  public updateUser!: (param: UpdateUserProps) => void;
  @ledger.Action
  public createTransaction!: (param: NewTransactionProps) => void;

  private valid = false;
  private loading = false;
  private error = false;
  private paid = false;
  private amount = '';
  private rules = {
    required: (v: string) => !!v || 'This field is required',
    isCurrency: (v: string) => this.isValidCurrency(v) || 'Invalid currency',
  };
  private amountSelections = [
    {
      active: false,
      amount: '25',
    },
    {
      active: false,
      amount: '50',
      popular: true,
    },
    {
      active: false,
      amount: '100',
    },
  ];

  get payer() {
    if (this.userProfile.data) {
      return {
        name: {
          givenName: this.userProfile.data.firstName,
          surname: this.userProfile.data.lastName,
        },
      };
    }
    return {};
  }

  get orders() {
    return [
      {
        description: 'Deposit to kingpin.gg',
        amount: {
          currencyCode: 'USD',
          value: this.amount,
        },
      },
    ];
  }

  get balance() {
    if (this.userProfile.data) {
      return new Currency(this.userProfile.data.currentBalance);
    }
    return new Currency({
      currency: 'USD',
      dollars: 0,
      cents: 0,
    });
  }

  public setAmount(item: { active: boolean; amount: string }, i: number) {
    this.amountSelections.forEach((_, index) => {
      if (index === i) {
        this.amountSelections[index].active = true;
      } else {
        this.amountSelections[index].active = false;
      }
    });
    this.amount = item.amount;
  }

  public isValidCurrency(v: string) {
    if (this.userProfile.data) {
      if (Number.isNaN(Number(v))) return false;
      if (Number(v) < 10) return '$10 is the minimum amount';
      if (Number(v) > 1000) return '$1000 is the maximum amount';

      const regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
      return regex.test(v);
    }
    return false;
  }

  public handleLoading() {
    this.loading = true;
  }

  public async handlePaid() {
    this.loading = false;
    this.paid = true;
    // update user's balance
    if (this.userProfile.data) {
      const newBalance = this.balance.add(Number(this.amount));
      const newDate = new Date();

      const newTransaction = {
        amount: Number(this.amount),
        description: 'deposit',
        user: {
          _id: this.userProfile.data._id,
          firstName: this.userProfile.data.firstName,
          lastName: this.userProfile.data.lastName,
          previousBalance: this.userProfile.data.currentBalance,
          currentBalance: newBalance,
        },
        createdAt: newDate,
        updatedAt: newDate,
      };

      const userUpdateBalance = {
        id: this.userProfile.data._id,
        currentBalance: newBalance,
        updatedAt: newDate,
      };

      await this.createTransaction(newTransaction);
      await this.updateUser(userUpdateBalance);
    }
  }

  public handleError(err: string) {
    this.loading = false;
    this.error = true;
    console.error(err);
  }
}
</script>

<style lang="scss" scoped>
.content-container {
  min-height: calc(100vh - 212px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-title {
  font-size: 28px;
}

.selection-container {
  display: flex;
  justify-content: center;
  align-content: center;
  margin: 18px 0;

  div {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    height: 100px;
    width: 120px;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;

    .banner {
      position: absolute;
      top: 0px;
      height: 20px;
      border-radius: 4px 4px 0 0;
      font-size: 14px;
    }
  }

  & > :first-child {
    margin-right: 10px;
  }

  & > :last-child {
    margin-left: 10px;
  }

  & > :not(:first-child) and :not(:last-child) {
    margin: 0 10px;
  }
}

.payment-button {
  min-height: 200px;
}

.success-container {
  max-width: 400px;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
