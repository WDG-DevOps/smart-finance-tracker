import { RecurringTransaction, Transaction, Wallet } from '../models/index.js';
import { Op } from 'sequelize';

export const createRecurring = async (req, res) => {
  try {
    const { walletId, type, category, amount, description, frequency, dayOfMonth, nextDueDate } = req.body;

    const recurring = await RecurringTransaction.create({
      userId: req.user.id,
      walletId,
      type,
      category,
      amount,
      description,
      frequency: frequency || 'monthly',
      dayOfMonth,
      nextDueDate: nextDueDate || new Date()
    });

    res.status(201).json({
      message: 'Recurring transaction created successfully',
      recurring
    });
  } catch (error) {
    console.error('Create recurring error:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
};

export const getRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [{ model: Wallet, as: 'wallet', attributes: ['id', 'name', 'type'] }],
      order: [['nextDueDate', 'ASC']]
    });

    res.json({ recurring });
  } catch (error) {
    console.error('Get recurring error:', error);
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
};

export const updateRecurring = async (req, res) => {
  try {
    const { id } = req.params;
    const { walletId, type, category, amount, description, frequency, dayOfMonth, nextDueDate, isActive } = req.body;

    const recurring = await RecurringTransaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    if (walletId) recurring.walletId = walletId;
    if (type) recurring.type = type;
    if (category) recurring.category = category;
    if (amount) recurring.amount = amount;
    if (description !== undefined) recurring.description = description;
    if (frequency) recurring.frequency = frequency;
    if (dayOfMonth) recurring.dayOfMonth = dayOfMonth;
    if (nextDueDate) recurring.nextDueDate = nextDueDate;
    if (isActive !== undefined) recurring.isActive = isActive;

    await recurring.save();

    res.json({
      message: 'Recurring transaction updated successfully',
      recurring
    });
  } catch (error) {
    console.error('Update recurring error:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
};

export const deleteRecurring = async (req, res) => {
  try {
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    recurring.isActive = false;
    await recurring.save();

    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring error:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
};

// This function should be called by a cron job or scheduler
export const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    const recurring = await RecurringTransaction.findAll({
      where: {
        isActive: true,
        nextDueDate: {
          [Op.lte]: now
        }
      }
    });

    for (const rec of recurring) {
      const wallet = await Wallet.findByPk(rec.walletId);
      if (!wallet) continue;

      // Create transaction
      const transaction = await Transaction.create({
        userId: rec.userId,
        walletId: rec.walletId,
        type: rec.type,
        category: rec.category,
        amount: rec.amount,
        description: rec.description,
        date: rec.nextDueDate,
        isRecurring: true,
        recurringId: rec.id
      });

      // Update wallet balance
      if (rec.type === 'income') {
        wallet.balance = parseFloat(wallet.balance) + parseFloat(rec.amount);
      } else {
        wallet.balance = parseFloat(wallet.balance) - parseFloat(rec.amount);
      }
      await wallet.save();

      // Calculate next due date
      let nextDate = new Date(rec.nextDueDate);
      if (rec.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (rec.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rec.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (rec.dayOfMonth) {
          nextDate.setDate(rec.dayOfMonth);
        }
      } else if (rec.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      rec.nextDueDate = nextDate;
      await rec.save();
    }

    return { processed: recurring.length };
  } catch (error) {
    console.error('Process recurring transactions error:', error);
    throw error;
  }
};
