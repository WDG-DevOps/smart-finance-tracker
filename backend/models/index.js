import sequelize from '../config/database.js';
import User from './User.js';
import Wallet from './Wallet.js';
import Transaction from './Transaction.js';
import Budget from './Budget.js';
import Goal from './Goal.js';
import Debt from './Debt.js';
import RecurringTransaction from './RecurringTransaction.js';

// Define associations
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

Transaction.belongsTo(Wallet, { foreignKey: 'transferToWalletId', as: 'transferToWallet' });

User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Goal, { foreignKey: 'userId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Debt, { foreignKey: 'userId', as: 'debts' });
Debt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RecurringTransaction, { foreignKey: 'userId', as: 'recurringTransactions' });
RecurringTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

RecurringTransaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });
Wallet.hasMany(RecurringTransaction, { foreignKey: 'walletId', as: 'recurringTransactions' });

Transaction.belongsTo(RecurringTransaction, { foreignKey: 'recurringId', as: 'recurringTransaction' });
RecurringTransaction.hasMany(Transaction, { foreignKey: 'recurringId', as: 'transactions' });

export {
  sequelize,
  User,
  Wallet,
  Transaction,
  Budget,
  Goal,
  Debt,
  RecurringTransaction
};
