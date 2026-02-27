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

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Profil trenutnog korisnika
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Podaci o profilu
 */
router.get('/me', authMiddleware, getProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Azuriraj profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil azuriran
 */
router.put('/me', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/users/me/stats:
 *   get:
 *     summary: Statistika korisnika
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistika
 */
router.get('/me/stats', authMiddleware, getUserStats);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Svi korisnici (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista korisnika
 */
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

export default router;
