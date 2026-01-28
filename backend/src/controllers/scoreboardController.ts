import { Request, Response } from 'express';
import { Match, User, Game, Event, Season } from '../models';
import sequelize from '../config/database';

export const getScoreboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId, seasonId, limit } = req.query;

    let whereClause: any = {};

    // Filter by game if specified
    if (gameId) {
      whereClause.gameId = gameId;
    }

    // Filter by season if specified (through event)
    let eventInclude: any = {
      model: Event,
      as: 'event',
      attributes: ['id', 'seasonId']
    };

    if (seasonId) {
      eventInclude.where = { seasonId };
    }

    // Get all matches with filters
    const matches = await Match.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'avatar'] },
        { model: Game, as: 'game', attributes: ['id', 'name'] },
        eventInclude
      ]
    });

    // Aggregate wins per user
    const userWins: { [key: number]: { user: any; wins: number; games: { [key: number]: number } } } = {};

    matches.forEach((match: any) => {
      const winnerId = match.winnerId;
      const winner = match.winner;
      const gameIdNum = match.gameId;

      if (!userWins[winnerId]) {
        userWins[winnerId] = {
          user: {
            id: winner.id,
            username: winner.username,
            avatar: winner.avatar
          },
          wins: 0,
          games: {}
        };
      }

      userWins[winnerId].wins++;

      if (!userWins[winnerId].games[gameIdNum]) {
        userWins[winnerId].games[gameIdNum] = 0;
      }
      userWins[winnerId].games[gameIdNum]++;
    });

    // Convert to array and sort by wins
    let scoreboard = Object.values(userWins)
      .sort((a, b) => b.wins - a.wins)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

    // Apply limit if specified
    if (limit) {
      scoreboard = scoreboard.slice(0, parseInt(limit as string));
    }

    res.json(scoreboard);
  } catch (error) {
    console.error('Get scoreboard error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju rang liste.' });
  }
};

export const getGameLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const game = await Game.findByPk(id);
    if (!game) {
      res.status(404).json({ message: 'Igra nije pronadjena.' });
      return;
    }

    // Get wins per user for this game
    const leaderboard = await Match.findAll({
      where: { gameId: id },
      attributes: [
        'winnerId',
        [sequelize.fn('COUNT', sequelize.col('Match.id')), 'wins']
      ],
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'avatar'] }
      ],
      group: ['winnerId', 'winner.id', 'winner.username', 'winner.avatar'],
      order: [[sequelize.literal('wins'), 'DESC']],
      limit: limit ? parseInt(limit as string) : 10
    });

    const result = leaderboard.map((entry: any, index: number) => ({
      rank: index + 1,
      user: {
        id: entry.winner.id,
        username: entry.winner.username,
        avatar: entry.winner.avatar
      },
      wins: parseInt(entry.dataValues.wins)
    }));

    res.json({
      game: {
        id: game.id,
        name: game.name
      },
      leaderboard: result
    });
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju rang liste za igru.' });
  }
};

export const getSeasons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const seasons = await Season.findAll({
      order: [['startDate', 'DESC']]
    });

    res.json(seasons);
  } catch (error) {
    console.error('Get seasons error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju sezona.' });
  }
};

export const createSeason = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      res.status(400).json({ message: 'Naziv, pocetak i kraj sezone su obavezni.' });
      return;
    }

    const season = await Season.create({
      name,
      startDate,
      endDate
    });

    res.status(201).json(season);
  } catch (error) {
    console.error('Create season error:', error);
    res.status(500).json({ message: 'Greska pri kreiranju sezone.' });
  }
};
