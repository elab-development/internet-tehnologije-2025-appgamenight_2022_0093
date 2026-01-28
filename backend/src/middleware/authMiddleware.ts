import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: User;
  userId?: number;
}

interface JwtPayload {
  userId: number;
  role: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Pristup odbijen. Token nije pronadjen.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'Korisnik ne postoji.' });
      return;
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token je istekao.' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Nevazeci token.' });
      return;
    }
    res.status(500).json({ message: 'Greska pri autentifikaciji.' });
  }
};

// Optional auth - doesn't fail if no token, just sets user if present
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findByPk(decoded.userId);

    if (user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch {
    // Token invalid, but that's okay for optional auth
    next();
  }
};
