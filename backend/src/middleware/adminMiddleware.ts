import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Pristup odbijen. Niste prijavljeni.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Pristup odbijen. Potrebna admin prava.' });
    return;
  }

  next();
};

// Middleware that allows both admin and player roles
export const playerOrAdminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Pristup odbijen. Niste prijavljeni.' });
    return;
  }

  if (req.user.role === 'guest') {
    res.status(403).json({ message: 'Pristup odbijen. Gosti nemaju pristup ovoj funkciji.' });
    return;
  }

  next();
};
