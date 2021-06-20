// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
};

export default {
  asyncForEach,
};
