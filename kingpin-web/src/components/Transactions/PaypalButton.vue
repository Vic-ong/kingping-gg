<template>
  <div ref="paypal"></div>
</template>

<script lang="ts">
import { Vue, Component, Ref, Prop } from 'vue-property-decorator';
import { camelToSnakeObject } from '@/utils/formats';

interface PaypalWindowProps extends Window {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  paypal: any;
}

interface AmountProps {
  currencyCode: string;
  value: string;
}
interface PurchaseUnitProps {
  referenceId?: string;
  name: string;
  amount: AmountProps;
}
interface OrderProps {
  intent: string;
  purchaseUnits: PurchaseUnitProps[];
}

interface PayerName {
  givenName: string;
  surname: string;
}
interface PayerProps {
  name: PayerName;
}

declare const window: PaypalWindowProps;

@Component({
  name: 'PaypalButton',
})
export default class PaypalButton extends Vue {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  @Ref('paypal') readonly paypal!: any;
  @Prop() readonly orders!: OrderProps;
  @Prop() readonly payer!: PayerProps;

  mounted() {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.VUE_APP_PAYPAL_CLIENT_ID}`;
    script.addEventListener('load', this.setLoaded);
    document.body.appendChild(script);
  }

  public setLoaded() {
    window.paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create(
            camelToSnakeObject({
              intent: 'capture',
              payer: this.payer,
              purchaseUnits: this.orders,
              applicationContext: {
                shippingPreference: 'NO_SHIPPING',
                brandName: 'Kingpin.gg',
              },
            }),
          );
        },
        onApprove: async (data: any, actions: any) => {
          this.$emit('onLoading');
          const order = await actions.order.capture();
          this.$emit('onPaid', order);
        },
        onError: (err: string) => {
          this.$emit('onError', err);
        },
      })
      .render(this.$refs.paypal);
  }
}
</script>
