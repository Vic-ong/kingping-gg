import { CurrencyProps } from '@/store/types';

interface CurrencyObj {
  currency?: string;
  dollars: number;
  cents?: number;
}

const parseCents = (cents: string) => {
  if (cents === undefined || null) return 0;
  return cents.length === 2 ? cents : `${cents}0`;
};

export const splitCurrency = (val: number) => {
  const [dollars, cents] = val.toString().split('.');
  return [Number(dollars), Number(parseCents(cents))];
};

class Currency {
  currencyObj: CurrencyProps;
  currencyValue: number;

  constructor(currencyObj: CurrencyProps) {
    this.currencyObj = currencyObj;
    this.currencyValue = this.objToCurrencyValue(currencyObj);
  }

  // converts currency object to currency value
  // { dollars: 10, cents: 55 } --> 1055
  objToCurrencyValue(obj: CurrencyObj) {
    return obj.dollars * 100 + (obj.cents || 0);
  }

  // converts currency object to currency number
  // { dollars: 10, cents: 55 } --> 10.55
  objToCurrencyNum(obj?: CurrencyProps) {
    if (obj) {
      return obj.dollars + obj.cents / 100;
    }
    return this.currencyObj.dollars + this.currencyObj.cents / 100;
  }

  // converts currency value to currency object
  // 1055 --> { currency: 'USD', dollars: 10, cents: 55 }
  valToCurrencyObj(currencyValue: number, currency?: string) {
    const val = Number.isInteger(currencyValue) ? currencyValue / 100 : Math.round(currencyValue) / 100;
    if (Number.isInteger(val)) {
      return {
        currency: currency || this.currencyObj.currency,
        dollars: val,
        cents: 0,
      };
    }

    const [dollars, cents] = splitCurrency(val);
    return {
      currency: currency || this.currencyObj.currency,
      dollars: Number(dollars),
      cents: Number(cents),
    };
  }

  // converts string currency to currencyVal
  // '10.55' --> 1055
  numToCurrencyValue(val: number) {
    const [dollars, cents] = splitCurrency(val);
    return this.objToCurrencyValue({
      dollars: Number(dollars),
      cents: Number(cents),
    });
  }

  add(val: number) {
    const x = this.numToCurrencyValue(val);
    return this.valToCurrencyObj(this.currencyValue + x);
  }

  subtract(val: number) {
    const x = this.numToCurrencyValue(val);
    return this.valToCurrencyObj(this.currencyValue - x);
  }

  multiply(val: number) {
    const x = this.numToCurrencyValue(val);
    return this.valToCurrencyObj(this.currencyValue - x);
  }

  divide(val: number) {
    const x = this.numToCurrencyValue(val);
    return this.valToCurrencyObj(this.currencyValue / x);
  }
}

export default Currency;
