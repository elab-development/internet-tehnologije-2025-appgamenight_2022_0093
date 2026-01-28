import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getUserStats,
  getAllUsers
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, getProfile);

// PUT /api/users/me - Update current user profile
router.put('/me', authMiddleware, updateProfile);

// GET /api/users/me/stats - Get current user statistics
router.get('/me/stats', authMiddleware, getUserStats);

// GET /api/users - Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

export default router;
