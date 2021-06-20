/* eslint-disable  @typescript-eslint/no-explicit-any */
const isObject = (test: {}) =>
  typeof test === 'object' && test !== null && !Array.isArray(test) && !(test instanceof Date);

const isKeyId = (x: string) => x === '_id';

export const camelToSnake = (str: string) =>
  isKeyId(str) ? str : str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

export const snakeToCamel = (str: string) =>
  isKeyId(str)
    ? str
    : str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

const loopObject = (obj: { [x: string]: any }, fn: (str: string) => string) => {
  const newObj: { [x: string]: any } = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (isObject(value)) {
      newObj[fn(key)] = loopObject(value, fn);
    } else {
      newObj[fn(key)] = value;
    }
  });
  return newObj;
};

export const camelToSnakeObject = (obj: { [x: string]: any }) => loopObject(obj, camelToSnake);

export const snakeToCamelObject = (obj: { [x: string]: any }) => loopObject(obj, snakeToCamel);

export const round = (num: number, digits: number) => {
  return Math.round(num * digits * 10) / (digits * 10);
};

// Convert number to formatted number string
// eg: nFormatter(1520, 1) -> 1.5k
export const nFormatter = (num: number, digits: number) => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];

  const getSi = ({ value }: { value: number }) => num >= value;
  const { value = 1, symbol = '' } = num <= 1 ? si[0] : si.reverse().find(getSi) || {};
  return round(num / value, 2).toFixed(digits) + symbol;
};

export default {
  camelToSnake,
  snakeToCamel,
  camelToSnakeObject,
  snakeToCamelObject,
  nFormatter,
};
