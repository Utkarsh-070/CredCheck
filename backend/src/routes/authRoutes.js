import express from 'express';
import { loginWithGoogle, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginWithGoogle);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

export default router;
