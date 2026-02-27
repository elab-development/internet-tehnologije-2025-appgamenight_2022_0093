import { Router } from 'express';
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
} from '../controllers/gameController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Sve igre
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Lista igara
 */
router.get('/', getAllGames);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Igra po ID-u
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalji igre
 */
router.get('/:id', getGameById);

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Kreiraj igru (admin)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               minPlayers:
 *                 type: integer
 *               maxPlayers:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Igra kreirana
 */
router.post('/', authMiddleware, adminMiddleware, createGame);

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Azuriraj igru (admin)
 *     tags: [Games]
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
 *         description: Igra azurirana
 */
router.put('/:id', authMiddleware, adminMiddleware, updateGame);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Obrisi igru (admin)
 *     tags: [Games]
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
 *         description: Igra obrisana
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteGame);

export default router;
