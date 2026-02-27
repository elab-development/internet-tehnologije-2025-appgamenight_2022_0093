import { Router } from 'express';
import {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getLeaderboard
} from '../controllers/matchController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

/**
 * @swagger
 * /api/matches/leaderboard:
 *   get:
 *     summary: Rang lista igraca po pobedama
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Broj rezultata (default 10)
 *     responses:
 *       200:
 *         description: Rang lista
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Sve partije
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista partija
 */
router.get('/', getAllMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Partija po ID-u
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalji partije
 */
router.get('/:id', getMatchById);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Kreiraj novu partiju (admin)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, gameId, winnerId]
 *             properties:
 *               eventId:
 *                 type: integer
 *               gameId:
 *                 type: integer
 *               winnerId:
 *                 type: integer
 *               playedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Partija kreirana
 */
router.post('/', authMiddleware, adminMiddleware, createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Azuriraj partiju (admin)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Partija azurirana
 */
router.put('/:id', authMiddleware, adminMiddleware, updateMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Obrisi partiju (admin)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Partija obrisana
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteMatch);

export default router;
