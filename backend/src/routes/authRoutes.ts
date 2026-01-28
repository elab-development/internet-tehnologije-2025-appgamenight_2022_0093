import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register - User registration
router.post('/register', register);

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/logout - User logout
router.post('/logout', logout);

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, me);

export default router;
