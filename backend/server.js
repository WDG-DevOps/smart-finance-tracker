import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import client from 'prom-client';

// Import routes
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Import models and database
import { sequelize } from './models/index.js';
import { processRecurringTransactions } from './controllers/recurringController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Finance Tracker API is running' });
});

// Inisialisasi pengumpulan metrik default (CPU, Memory, dll)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Tambahkan endpoint /metrics
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Socket.io for real-time notifications
io.use((socket, next) => {
  // Authentication middleware for socket
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify token here if needed
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Process recurring transactions daily (should be moved to a cron job in production)
setInterval(async () => {
  try {
    await processRecurringTransactions();
    io.emit('recurring-processed', { message: 'Recurring transactions processed' });
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
}, 24 * 60 * 60 * 1000); // Every 24 hours

// Database connection and server start
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync({ alter: false }); // Set to true for development, false for production
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });

export { io };
