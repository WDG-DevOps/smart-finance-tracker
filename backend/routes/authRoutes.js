import express from 'express';
import {
  register,
  login,
  setAppLockPin,
  verifyAppLockPin,
  togglePrivacyMode
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/app-lock/pin', authenticateToken, setAppLockPin);
router.post('/app-lock/verify', authenticateToken, verifyAppLockPin);
router.post('/privacy-mode/toggle', authenticateToken, togglePrivacyMode);

export default router;
