import { Response } from 'express';
import { Op } from 'sequelize';
import { User, Match, Registration, Event, Game } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import sequelize from '../config/database';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Niste prijavljeni.' });
      return;
    }

    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju profila.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Niste prijavljeni.' });
      return;
    }

    const { username, email, avatar, currentPassword, newPassword } = req.body;

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ message: 'Trenutna lozinka je obavezna za promenu lozinke.' });
        return;
      }

      const isValid = await req.user.comparePassword(currentPassword);
      if (!isValid) {
        res.status(400).json({ message: 'Trenutna lozinka nije ispravna.' });
        return;
      }
    }

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json({ message: 'Korisnicko ime je vec zauzeto.' });
        return;
      }
    }

    // Check if email is taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Email je vec u upotrebi.' });
        return;
      }
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (newPassword) updateData.password = newPassword;

    await req.user.update(updateData);

    res.json({
      message: 'Profil uspesno azuriran.',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Greska pri azuriranju profila.' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Niste prijavljeni.' });
      return;
    }

    const userId = req.user.id;

    // Get total wins
    const totalWins = await Match.count({ where: { winnerId: userId } });

    // Get wins per game
    const winsPerGame = await Match.findAll({
      where: { winnerId: userId },
      attributes: [
        'gameId',
        [sequelize.fn('COUNT', sequelize.col('Match.id')), 'wins']
      ],
      include: [{ model: Game, as: 'game', attributes: ['id', 'name'] }],
      group: ['gameId', 'game.id', 'game.name']
    });

    // Get events attended
    const eventsAttended = await Registration.count({
      where: { userId, status: 'confirmed' }
    });

    // Get recent matches
    const recentMatches = await Match.findAll({
      where: { winnerId: userId },
      include: [
        { model: Game, as: 'game', attributes: ['id', 'name'] },
        { model: Event, as: 'event', attributes: ['id', 'name', 'date'] }
      ],
      order: [['playedAt', 'DESC']],
      limit: 5
    });

    // Get upcoming registrations
    const upcomingRegistrations = await Registration.findAll({
      where: { userId, status: { [Op.ne]: 'cancelled' } },
      include: [{
        model: Event,
        as: 'event',
        where: { date: { [Op.gte]: new Date() } },
        attributes: ['id', 'name', 'date', 'location']
      }],
      order: [[{ model: Event, as: 'event' }, 'date', 'ASC']],
      limit: 5
    });

    res.json({
      totalWins,
      eventsAttended,
      winsPerGame,
      recentMatches,
      upcomingRegistrations
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju statistike.' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'avatar', 'createdAt'],
      order: [['username', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju korisnika.' });
  }
};
