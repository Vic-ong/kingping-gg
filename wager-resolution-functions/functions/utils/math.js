const round = (num, digits) => {
  return Math.round(num * digits * 10) / (digits * 10);
};

module.exports = {
  round,
};
