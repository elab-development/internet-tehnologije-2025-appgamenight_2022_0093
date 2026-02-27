import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { connectDatabase } from './config/database';
import sequelize from './config/database';
import { swaggerSpec } from './config/swagger';

// Import models to initialize associations
import './models';

// Import routes
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import gameRoutes from './routes/gameRoutes';
import matchRoutes from './routes/matchRoutes';
import userRoutes from './routes/userRoutes';
import externalRoutes from './routes/externalRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100, // max 100 zahteva po IP-u
  message: { message: 'Previse zahteva. Pokusajte ponovo kasnije.' }
});
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Game Night API Docs'
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/external', externalRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta nije pronadjena.' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Interna greska servera.' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();

    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
