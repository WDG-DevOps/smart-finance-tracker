import { Transaction, Wallet, Debt, Goal } from '../models/index.js';
import { Op } from 'sequelize';
import { forecastEndOfMonth } from '../utils/forecasting.js';

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total balance across all wallets
    const wallets = await Wallet.findAll({
      where: { userId: req.user.id, isActive: true }
    });
    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

    // Monthly income and expense
    const monthlyIncome = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'income',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    const monthlyExpense = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    // Last month comparison
    const lastMonthIncome = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'income',
        date: { [Op.between]: [lastMonth, lastMonthEnd] }
      }
    });

    const lastMonthExpense = await Transaction.sum('amount', {
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [lastMonth, lastMonthEnd] }
      }
    });

    // Expense by category
    const expensesByCategory = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        'category',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    // Recent transactions
    const recentTransactions = await Transaction.findAll({
      where: { userId: req.user.id },
      include: [{ model: Wallet, as: 'wallet', attributes: ['id', 'name', 'type'] }],
      order: [['date', 'DESC']],
      limit: 10
    });

    // Net worth calculation
    const totalDebtsOwed = await Debt.sum('amount', {
      where: { userId: req.user.id, type: 'owed', isPaid: false }
    });

    const totalDebtsOwing = await Debt.sum('amount', {
      where: { userId: req.user.id, type: 'owing', isPaid: false }
    });

    const netWorth = totalBalance + (parseFloat(totalDebtsOwed || 0)) - (parseFloat(totalDebtsOwing || 0));

    // Forecast
    const dailyExpenses = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [startOfMonth, now] }
      },
      attributes: ['amount', 'date']
    });

    const daysRemaining = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));
    const avgDailyExpense = dailyExpenses.length > 0
      ? dailyExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0) / dailyExpenses.length
      : 0;

    const forecastedBalance = forecastEndOfMonth(totalBalance, [avgDailyExpense], daysRemaining);

    res.json({
      totalBalance: req.user.privacyMode ? '***' : totalBalance,
      monthlyIncome: req.user.privacyMode ? '***' : parseFloat(monthlyIncome || 0),
      monthlyExpense: req.user.privacyMode ? '***' : parseFloat(monthlyExpense || 0),
      lastMonthIncome: req.user.privacyMode ? '***' : parseFloat(lastMonthIncome || 0),
      lastMonthExpense: req.user.privacyMode ? '***' : parseFloat(lastMonthExpense || 0),
      expensesByCategory,
      recentTransactions,
      netWorth: req.user.privacyMode ? '***' : netWorth,
      forecastedBalance: req.user.privacyMode ? '***' : forecastedBalance,
      daysRemaining
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getCashFlow = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        date: { [Op.between]: [start, end] }
      },
      order: [['date', 'ASC']]
    });

    // Group by period
    const grouped = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      let key;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0, date: key };
      }

      if (t.type === 'income') {
        grouped[key].income += parseFloat(t.amount);
      } else if (t.type === 'expense') {
        grouped[key].expense += parseFloat(t.amount);
      }
    });

    const cashFlow = Object.values(grouped).map(item => ({
      ...item,
      net: item.income - item.expense
    }));

    res.json({ cashFlow });
  } catch (error) {
    console.error('Get cash flow error:', error);
    res.status(500).json({ error: 'Failed to fetch cash flow data' });
  }
};

export const getCategoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const expenses = await Transaction.findAll({
      where: {
        userId: req.user.id,
        type: 'expense',
        date: { [Op.between]: [start, end] }
      },
      attributes: [
        'category',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total'],
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    const total = expenses.reduce((sum, e) => sum + parseFloat(e.total), 0);

    const report = expenses.map(e => ({
      category: e.category,
      amount: parseFloat(e.total),
      count: parseInt(e.count),
      percentage: ((parseFloat(e.total) / total) * 100).toFixed(2)
    }));

    res.json({ report, total });
  } catch (error) {
    console.error('Get category report error:', error);
    res.status(500).json({ error: 'Failed to fetch category report' });
  }
};
