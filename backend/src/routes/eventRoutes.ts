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

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Svi dogadjaji
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pretraga po nazivu
 *     responses:
 *       200:
 *         description: Lista dogadjaja
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Dogadjaj po ID-u
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalji dogadjaja
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Kreiraj dogadjaj (admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, date, gameId]
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               gameId:
 *                 type: integer
 *               maxParticipants:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dogadjaj kreiran
 */
router.post('/', authMiddleware, adminMiddleware, createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Azuriraj dogadjaj (admin)
 *     tags: [Events]
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
 *         description: Dogadjaj azuriran
 */
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Obrisi dogadjaj (admin)
 *     tags: [Events]
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
 *         description: Dogadjaj obrisan
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

/**
 * @swagger
 * /api/events/{id}/register:
 *   post:
 *     summary: Prijava na dogadjaj
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Prijava uspesna
 */
router.post('/:id/register', authMiddleware, playerOrAdminMiddleware, registerForEvent);

/**
 * @swagger
 * /api/events/{id}/register:
 *   delete:
 *     summary: Odjava sa dogadjaja
 *     tags: [Events]
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
 *         description: Odjava uspesna
 */
router.delete('/:id/register', authMiddleware, playerOrAdminMiddleware, unregisterFromEvent);

export default router;
