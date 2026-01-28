import { Router } from 'express';
import {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
} from '../controllers/matchController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// GET /api/matches - Get all matches
router.get('/', getAllMatches);

// GET /api/matches/:id - Get match by ID
router.get('/:id', getMatchById);

// POST /api/matches - Create match/result (admin only)
router.post('/', authMiddleware, adminMiddleware, createMatch);

// PUT /api/matches/:id - Update match (admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateMatch);

// DELETE /api/matches/:id - Delete match (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteMatch);

export default router;
