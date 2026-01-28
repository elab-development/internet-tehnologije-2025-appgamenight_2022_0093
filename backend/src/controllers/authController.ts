import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (userId: number, role: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Sva polja su obavezna.' });
      return;
    }

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'Korisnik sa ovim emailom vec postoji.' });
      return;
    }

    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      res.status(400).json({ message: 'Korisnicko ime je zauzeto.' });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'player'
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registracija uspesna.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Greska pri registraciji.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email i lozinka su obavezni.' });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Pogresni podaci za prijavu.' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Pogresni podaci za prijavu.' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Prijava uspesna.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Greska pri prijavi.' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT is stateless, so logout is handled on client side by removing token
  res.json({ message: 'Odjava uspesna.' });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Niste prijavljeni.' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju podataka.' });
  }
};
