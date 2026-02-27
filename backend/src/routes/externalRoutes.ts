import { Router } from 'express';
import { searchBGG, getBGGDetails, getWeather } from '../controllers/externalController';

const router = Router();

/**
 * @swagger
 * /api/external/bgg/search:
 *   get:
 *     summary: Pretrazi BoardGameGeek
 *     tags: [External]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Naziv igre za pretragu
 *     responses:
 *       200:
 *         description: Lista pronadjenih igara
 */
router.get('/bgg/search', searchBGG);

/**
 * @swagger
 * /api/external/bgg/{id}:
 *   get:
 *     summary: Detalji igre sa BoardGameGeek
 *     tags: [External]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: BGG ID igre
 *     responses:
 *       200:
 *         description: Detalji igre
 */
router.get('/bgg/:id', getBGGDetails);

/**
 * @swagger
 * /api/external/weather:
 *   get:
 *     summary: Vremenska prognoza za grad
 *     tags: [External]
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Naziv grada
 *     responses:
 *       200:
 *         description: Podaci o vremenu
 */
router.get('/weather', getWeather);

export default router;
