import { Transaction, Wallet, RecurringTransaction } from '../models/index.js';
import { categorizeTransaction } from '../utils/categorization.js';
import { detectAnomaly } from '../utils/anomalyDetection.js';
import { Op } from 'sequelize';

export const createTransaction = async (req, res) => {
  try {
    const { walletId, type, category, amount, description, date, transferToWalletId } = req.body;
    const receiptImage = req.file ? req.file.filename : null;

    // Auto-categorize if category not provided
    const finalCategory = category || categorizeTransaction(description || '');

    // Get wallet
    const wallet = await Wallet.findOne({
      where: { id: walletId, userId: req.user.id }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Handle transfer
    if (type === 'transfer' && transferToWalletId) {
      const toWallet = await Wallet.findOne({
        where: { id: transferToWalletId, userId: req.user.id }
      });

      if (!toWallet) {
        return res.status(404).json({ error: 'Destination wallet not found' });
      }

      // Deduct from source wallet
      wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
      await wallet.save();

      // Add to destination wallet
      toWallet.balance = parseFloat(toWallet.balance) + parseFloat(amount);
      await toWallet.save();

      // Create transfer transaction
      const transaction = await Transaction.create({
        userId: req.user.id,
        walletId,
        type: 'transfer',
        category: 'Transfer',
        amount,
        description: description || `Transfer to ${toWallet.name}`,
        date: date || new Date(),
        transferToWalletId,
        receiptImage
      });

      return res.status(201).json({
        message: 'Transfer completed successfully',
        transaction
      });
    }

    // Handle income/expense
    if (type === 'income') {
      wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    } else if (type === 'expense') {
      wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    }
    await wallet.save();

    // Anomaly detection for expenses
    let anomalyAlert = null;
    if (type === 'expense') {
      const recentExpenses = await Transaction.findAll({
        where: {
          userId: req.user.id,
          type: 'expense',
          category: finalCategory,
          date: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 3)) }
        },
        attributes: ['amount']
      });

      const amounts = recentExpenses.map(t => parseFloat(t.amount));
      anomalyAlert = detectAnomaly(parseFloat(amount), amounts);
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      walletId,
      type,
      category: finalCategory,
      amount,
      description,
      date: date || new Date(),
      receiptImage
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      anomalyAlert: anomalyAlert?.isAnomaly ? anomalyAlert : null
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { walletId, type, category, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const where = { userId: req.user.id };
    if (walletId) where.walletId = walletId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Wallet, as: 'wallet', attributes: ['id', 'name', 'type'] },
        { model: Wallet, as: 'transferToWallet', attributes: ['id', 'name', 'type'], required: false }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { walletId, type, category, amount, description, date } = req.body;
    const receiptImage = req.file ? req.file.filename : null;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert old transaction effect on wallet
    const oldWallet = await Wallet.findByPk(transaction.walletId);
    if (transaction.type === 'income') {
      oldWallet.balance = parseFloat(oldWallet.balance) - parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      oldWallet.balance = parseFloat(oldWallet.balance) + parseFloat(transaction.amount);
    }
    await oldWallet.save();

    // Update transaction
    if (walletId) transaction.walletId = walletId;
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (amount) transaction.amount = amount;
    if (description !== undefined) transaction.description = description;
    if (receiptImage) transaction.receiptImage = receiptImage;
    if (date) transaction.date = date;

    await transaction.save();

    // Apply new transaction effect
    const newWallet = await Wallet.findByPk(transaction.walletId);
    if (transaction.type === 'income') {
      newWallet.balance = parseFloat(newWallet.balance) + parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      newWallet.balance = parseFloat(newWallet.balance) - parseFloat(transaction.amount);
    }
    await newWallet.save();

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert transaction effect on wallet
    const wallet = await Wallet.findByPk(transaction.walletId);
    if (transaction.type === 'income') {
      wallet.balance = parseFloat(wallet.balance) - parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      wallet.balance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
    } else if (transaction.type === 'transfer') {
      wallet.balance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
      const toWallet = await Wallet.findByPk(transaction.transferToWalletId);
      if (toWallet) {
        toWallet.balance = parseFloat(toWallet.balance) - parseFloat(transaction.amount);
        await toWallet.save();
      }
    }
    await wallet.save();

    await transaction.destroy();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
