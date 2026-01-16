import express from 'express';
import {
  getDashboard,
  getCashFlow,
  getCategoryReport
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboard);
router.get('/cash-flow', getCashFlow);
router.get('/category-report', getCategoryReport);

export default router;
