import { Request, Response } from 'express';
import { Match, User, Game, Event } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import sequelize from '../config/database';

export const getAllMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, gameId, limit } = req.query;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (gameId) {
      where.gameId = gameId;
    }

    const matches = await Match.findAll({
      where,
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'avatar'] },
        { model: Game, as: 'game', attributes: ['id', 'name'] },
        { model: Event, as: 'event', attributes: ['id', 'name', 'date'] }
      ],
      order: [['playedAt', 'DESC']],
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju partija.' });
  }
};

export const getMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await Match.findByPk(id, {
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'avatar'] },
        { model: Game, as: 'game' },
        { model: Event, as: 'event' }
      ]
    });

    if (!match) {
      res.status(404).json({ message: 'Partija nije pronadjena.' });
      return;
    }

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju partije.' });
  }
};

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, gameId, winnerId, playedAt } = req.body;

    if (!eventId || !gameId || !winnerId) {
      res.status(400).json({ message: 'Event, igra i pobednik su obavezni.' });
      return;
    }

    // Verify event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      res.status(400).json({ message: 'Dogadjaj ne postoji.' });
      return;
    }

    // Verify game exists
    const game = await Game.findByPk(gameId);
    if (!game) {
      res.status(400).json({ message: 'Igra ne postoji.' });
      return;
    }

    // Verify winner exists
    const winner = await User.findByPk(winnerId);
    if (!winner) {
      res.status(400).json({ message: 'Pobednik ne postoji.' });
      return;
    }

    const match = await Match.create({
      eventId,
      gameId,
      winnerId,
      playedAt: playedAt || new Date()
    });

    const createdMatch = await Match.findByPk(match.id, {
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username'] },
        { model: Game, as: 'game', attributes: ['id', 'name'] },
        { model: Event, as: 'event', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json(createdMatch);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Greska pri kreiranju partije.' });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { winnerId, playedAt } = req.body;

    const match = await Match.findByPk(id);

    if (!match) {
      res.status(404).json({ message: 'Partija nije pronadjena.' });
      return;
    }

    if (winnerId) {
      const winner = await User.findByPk(winnerId);
      if (!winner) {
        res.status(400).json({ message: 'Pobednik ne postoji.' });
        return;
      }
    }

    await match.update({
      winnerId: winnerId || match.winnerId,
      playedAt: playedAt || match.playedAt
    });

    const updatedMatch = await Match.findByPk(match.id, {
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username'] },
        { model: Game, as: 'game', attributes: ['id', 'name'] },
        { model: Event, as: 'event', attributes: ['id', 'name'] }
      ]
    });

    res.json(updatedMatch);
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ message: 'Greska pri azuriranju partije.' });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await Match.findByPk(id);

    if (!match) {
      res.status(404).json({ message: 'Partija nije pronadjena.' });
      return;
    }

    await match.destroy();

    res.json({ message: 'Partija uspesno obrisana.' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ message: 'Greska pri brisanju partije.' });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;

    const leaderboard = await Match.findAll({
      attributes: [
        'winnerId',
        [sequelize.fn('COUNT', sequelize.col('Match.id')), 'wins']
      ],
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'avatar'] }
      ],
      group: ['winnerId', 'winner.id', 'winner.username', 'winner.avatar'],
      order: [[sequelize.fn('COUNT', sequelize.col('Match.id')), 'DESC']],
      limit: limit ? parseInt(limit as string) : 10
    });

    const result = leaderboard.map((entry: any, index: number) => ({
      rank: index + 1,
      user: entry.winner,
      wins: parseInt(entry.dataValues.wins)
    }));

    res.json(result);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju rang liste.' });
  }
};
