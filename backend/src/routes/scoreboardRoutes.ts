import { Router } from 'express';
import {
  getScoreboard,
  getGameLeaderboard,
  getSeasons,
  createSeason
} from '../controllers/scoreboardController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// GET /api/scoreboard - Get overall scoreboard
router.get('/', getScoreboard);

// GET /api/scoreboard/games/:id - Get leaderboard for specific game
router.get('/games/:id', getGameLeaderboard);

// GET /api/scoreboard/seasons - Get all seasons
router.get('/seasons', getSeasons);

// POST /api/scoreboard/seasons - Create season (admin only)
router.post('/seasons', authMiddleware, adminMiddleware, createSeason);

export default router;
