import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registracija novog korisnika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registracija uspesna
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prijava uspesna
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Odjava korisnika
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Odjava uspesna
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Trenutno prijavljeni korisnik
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Podaci o korisniku
 */
router.get('/me', authMiddleware, me);

export default router;
