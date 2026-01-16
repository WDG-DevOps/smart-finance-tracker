import { Wallet, Transaction } from '../models/index.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export const createWallet = async (req, res) => {
  try {
    const { name, type, balance, currency } = req.body;
    
    const wallet = await Wallet.create({
      userId: req.user.id,
      name,
      type: type || 'Cash',
      balance: balance || 0,
      currency: currency || 'IDR'
    });

    res.status(201).json({
      message: 'Wallet created successfully',
      wallet: {
        ...wallet.toJSON(),
        balance: req.user.privacyMode ? '***' : wallet.balance
      }
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
};

export const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    const walletsData = wallets.map(wallet => ({
      ...wallet.toJSON(),
      balance: req.user.privacyMode ? '***' : wallet.balance
    }));

    res.json({ wallets: walletsData });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

export const updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance, currency, isActive } = req.body;

    const wallet = await Wallet.findOne({
      where: { id, userId: req.user.id }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (name) wallet.name = name;
    if (type) wallet.type = type;
    if (balance !== undefined) wallet.balance = balance;
    if (currency) wallet.currency = currency;
    if (isActive !== undefined) wallet.isActive = isActive;

    await wallet.save();

    res.json({
      message: 'Wallet updated successfully',
      wallet: {
        ...wallet.toJSON(),
        balance: req.user.privacyMode ? '***' : wallet.balance
      }
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
};

export const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.findOne({
      where: { id, userId: req.user.id }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    wallet.isActive = false;
    await wallet.save();

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
};

export const getWalletBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.findOne({
      where: { id, userId: req.user.id }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      balance: req.user.privacyMode ? '***' : wallet.balance,
      currency: wallet.currency
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
};
