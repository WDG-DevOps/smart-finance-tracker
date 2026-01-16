import express from 'express';
import {
  createDebt,
  getDebts,
  updateDebt,
  deleteDebt,
  getUpcomingDebts
} from '../controllers/debtController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createDebt);
router.get('/', getDebts);
router.get('/upcoming', getUpcomingDebts);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);

export default router;
