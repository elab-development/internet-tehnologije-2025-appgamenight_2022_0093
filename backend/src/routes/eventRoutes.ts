import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
} from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware, playerOrAdminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// GET /api/events - Get all events
router.get('/', getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// POST /api/events - Create event (admin only)
router.post('/', authMiddleware, adminMiddleware, createEvent);

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

// POST /api/events/:id/register - Register for event (players and admins)
router.post('/:id/register', authMiddleware, playerOrAdminMiddleware, registerForEvent);

// DELETE /api/events/:id/register - Unregister from event (players and admins)
router.delete('/:id/register', authMiddleware, playerOrAdminMiddleware, unregisterFromEvent);

export default router;
