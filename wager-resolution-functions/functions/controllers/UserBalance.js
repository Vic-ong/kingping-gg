const currency = require('currency.js');
const Users = require('@/models/Users');
const Transactions = require('@/models/Transactions');

const convertToBalance = (val) => {
  const currencyParts = currency(val / 100)
    .value.toString()
    .split('.');
  const [dollars] = currencyParts;
  let cents = 0;

  if (currencyParts.length === 2) {
    // eslint-disable-next-line prefer-destructuring
    cents = currencyParts[1];
    if (cents.length === 1) {
      cents = `${cents}0`;
    } else if (cents.length > 2) {
      cents = cents.substring(0, 2);
    }
  }

  return {
    currency: 'USD',
    dollars: parseInt(dollars, 10),
    cents: parseInt(cents, 10),
  };
};

const updateUserBalance = async ({ user, amount, remark }, dryRun) => {
  const { _id: id } = user;
  const userData = await Users.getUser(id);

  const { currentBalance, firstName, lastName } = userData;

  // TODO: convert user balance to string
  const balanceVal = currentBalance.dollars * 100 + currentBalance.cents;
  const newBalanceVal = amount * 100 + balanceVal;
  const newBalance = convertToBalance(newBalanceVal);

  const userUpdateParam = {
    id,
    currentBalance: newBalance,
  };
  const newTransaction = {
    amount: -amount,
    description: remark,
    user: {
      _id: id,
      firstName,
      lastName,
      previousBalance: currentBalance,
      currentBalance: newBalance,
    },
  };

  if (dryRun) {
    console.log('\n=== Update User Balance ===');
    console.log(userUpdateParam);
    console.log(newTransaction);
  } else {
    await Users.updateUser(userUpdateParam);
    await Transactions.createTransaction(newTransaction);
  }

  return {
    balance: currency(newBalanceVal / 100).value,
    prevBalance: currency(balanceVal / 100).value,
  };
};

module.exports = {
  updateUserBalance,
};
