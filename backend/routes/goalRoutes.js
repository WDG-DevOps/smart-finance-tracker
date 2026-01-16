import express from 'express';
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  addToGoal
} from '../controllers/goalController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.post('/:id/add', addToGoal);
router.delete('/:id', deleteGoal);

export default router;
