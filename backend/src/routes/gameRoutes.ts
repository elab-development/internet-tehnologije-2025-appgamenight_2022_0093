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

// GET /api/games - Get all games
router.get('/', getAllGames);

// GET /api/games/:id - Get game by ID
router.get('/:id', getGameById);

// POST /api/games - Create game (admin only)
router.post('/', authMiddleware, adminMiddleware, createGame);

// PUT /api/games/:id - Update game (admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateGame);

// DELETE /api/games/:id - Delete game (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteGame);

export default router;
