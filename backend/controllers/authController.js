import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        hasAppLockPin: false
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        privacyMode: user.privacyMode,
        hasAppLockPin: !!user.appLockPin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const setAppLockPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findByPk(req.user.id);

    const hashedPin = await bcrypt.hash(pin, 10);
    user.appLockPin = hashedPin;
    await user.save();

    res.json({ message: 'App lock PIN set successfully' });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
};

export const verifyAppLockPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.appLockPin) {
      return res.status(400).json({ error: 'PIN not set' });
    }

    const isValid = await bcrypt.compare(pin, user.appLockPin);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified' });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'PIN verification failed' });
  }
};

export const togglePrivacyMode = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    user.privacyMode = !user.privacyMode;
    await user.save();

    res.json({
      message: 'Privacy mode updated',
      privacyMode: user.privacyMode
    });
  } catch (error) {
    console.error('Toggle privacy mode error:', error);
    res.status(500).json({ error: 'Failed to update privacy mode' });
  }
};
