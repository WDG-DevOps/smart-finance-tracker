import express from 'express';
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createBudget);
router.get('/', getBudgets);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
