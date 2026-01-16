import { Budget, Transaction } from '../models/index.js';
import { Op } from 'sequelize';

export const createBudget = async (req, res) => {
  try {
    const { category, amount, period, startDate, endDate } = req.body;

    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      period: period || 'monthly',
      startDate: startDate || new Date(),
      endDate
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    // Calculate spending for each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const now = new Date();
        let startDate, endDate;

        if (budget.period === 'monthly') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (budget.period === 'weekly') {
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        } else if (budget.period === 'yearly') {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
        } else {
          startDate = budget.startDate;
          endDate = budget.endDate || now;
        }

        const expenses = await Transaction.sum('amount', {
          where: {
            userId: req.user.id,
            type: 'expense',
            category: budget.category,
            date: {
              [Op.between]: [startDate, endDate]
            }
          }
        });

        const spent = parseFloat(expenses || 0);
        const total = parseFloat(budget.amount);
        const percentage = (spent / total) * 100;
        const remaining = total - spent;

        let status = 'safe';
        if (percentage >= 100) status = 'exceeded';
        else if (percentage >= 80) status = 'warning';
        else if (percentage >= 60) status = 'caution';

        return {
          ...budget.toJSON(),
          spent,
          remaining,
          percentage: Math.min(100, percentage),
          status
        };
      })
    );

    res.json({ budgets: budgetsWithProgress });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, period, startDate, endDate, isActive } = req.body;

    const budget = await Budget.findOne({
      where: { id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    if (category) budget.category = category;
    if (amount) budget.amount = amount;
    if (period) budget.period = period;
    if (startDate) budget.startDate = startDate;
    if (endDate) budget.endDate = endDate;
    if (isActive !== undefined) budget.isActive = isActive;

    await budget.save();

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, userId: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    budget.isActive = false;
    await budget.save();

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
