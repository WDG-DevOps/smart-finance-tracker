import express from 'express';
import {
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring
} from '../controllers/recurringController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createRecurring);
router.get('/', getRecurring);
router.put('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);

export default router;
