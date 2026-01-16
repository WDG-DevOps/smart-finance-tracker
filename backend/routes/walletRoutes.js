import express from 'express';
import {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
  getWalletBalance
} from '../controllers/walletController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createWallet);
router.get('/', getWallets);
router.get('/:id/balance', getWalletBalance);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);

export default router;
