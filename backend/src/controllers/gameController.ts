import { Request, Response } from 'express';
import { Game, Match, User } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllGames = async (_req: Request, res: Response): Promise<void> => {
  try {
    const games = await Game.findAll({
      order: [['name', 'ASC']]
    });

    res.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju igara.' });
  }
};

export const getGameById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: Match,
          as: 'matches',
          include: [{ model: User, as: 'winner', attributes: ['id', 'username'] }],
          limit: 10,
          order: [['playedAt', 'DESC']]
        }
      ]
    });

    if (!game) {
      res.status(404).json({ message: 'Igra nije pronadjena.' });
      return;
    }

    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju igre.' });
  }
};

export const createGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, minPlayers, maxPlayers, description } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Naziv igre je obavezan.' });
      return;
    }

    if (minPlayers && maxPlayers && minPlayers > maxPlayers) {
      res.status(400).json({ message: 'Minimalan broj igraca ne moze biti veci od maksimalnog.' });
      return;
    }

    const game = await Game.create({
      name,
      minPlayers: minPlayers || 2,
      maxPlayers: maxPlayers || 4,
      description
    });

    res.status(201).json(game);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Greska pri kreiranju igre.' });
  }
};

export const updateGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, minPlayers, maxPlayers, description } = req.body;

    const game = await Game.findByPk(id);

    if (!game) {
      res.status(404).json({ message: 'Igra nije pronadjena.' });
      return;
    }

    if (minPlayers && maxPlayers && minPlayers > maxPlayers) {
      res.status(400).json({ message: 'Minimalan broj igraca ne moze biti veci od maksimalnog.' });
      return;
    }

    await game.update({
      name: name || game.name,
      minPlayers: minPlayers !== undefined ? minPlayers : game.minPlayers,
      maxPlayers: maxPlayers !== undefined ? maxPlayers : game.maxPlayers,
      description: description !== undefined ? description : game.description
    });

    res.json(game);
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: 'Greska pri azuriranju igre.' });
  }
};

export const deleteGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await Game.findByPk(id);

    if (!game) {
      res.status(404).json({ message: 'Igra nije pronadjena.' });
      return;
    }

    // Check if game has matches
    const matchCount = await Match.count({ where: { gameId: id } });
    if (matchCount > 0) {
      res.status(400).json({ message: 'Ne mozete obrisati igru koja ima zapisane partije.' });
      return;
    }

    await game.destroy();

    res.json({ message: 'Igra uspesno obrisana.' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Greska pri brisanju igre.' });
  }
};
