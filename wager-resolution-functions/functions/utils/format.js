const isObject = (test) => typeof test === 'object' && test !== null && !Array.isArray(test) && !(test instanceof Date);

const isKeyId = (x) => x === '_id';

const toSnake = (str) => (isKeyId(str) ? str : str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`));

const toCamel = (str) =>
  isKeyId(str)
    ? str
    : str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

const loopObject = (obj, fn) => {
  const newObj = {};
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

const camelToSnake = (obj) => loopObject(obj, toSnake);

const snakeToCamel = (obj) => loopObject(obj, toCamel);

module.exports = {
  toSnake,
  toCamel,
  camelToSnake,
  snakeToCamel,
};
