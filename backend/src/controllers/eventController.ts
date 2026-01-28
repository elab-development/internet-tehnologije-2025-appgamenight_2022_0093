import { Request, Response } from 'express';
import { Event, Season, Game, Registration, User, EventGame } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import { Op } from 'sequelize';

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, seasonId } = req.query;

    const where: any = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (seasonId) {
      where.seasonId = seasonId;
    }

    const events = await Event.findAll({
      where,
      include: [
        { model: Season, as: 'season' },
        { model: Game, as: 'games' },
        {
          model: Registration,
          as: 'registrations',
          include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju dogadjaja.' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        { model: Season, as: 'season' },
        { model: Game, as: 'games' },
        {
          model: Registration,
          as: 'registrations',
          include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
            { model: Game, as: 'preferredGame' }
          ]
        }
      ]
    });

    if (!event) {
      res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Greska pri dobijanju dogadjaja.' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, date, description, location, seasonId, maxParticipants, gameIds } = req.body;

    if (!name || !date || !seasonId) {
      res.status(400).json({ message: 'Naziv, datum i sezona su obavezni.' });
      return;
    }

    const season = await Season.findByPk(seasonId);
    if (!season) {
      res.status(400).json({ message: 'Sezona ne postoji.' });
      return;
    }

    const event = await Event.create({
      name,
      date,
      description,
      location,
      seasonId,
      maxParticipants
    });

    // Associate games if provided
    if (gameIds && Array.isArray(gameIds)) {
      for (const gameId of gameIds) {
        await EventGame.create({ eventId: event.id, gameId });
      }
    }

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        { model: Season, as: 'season' },
        { model: Game, as: 'games' }
      ]
    });

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Greska pri kreiranju dogadjaja.' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, date, description, location, seasonId, maxParticipants, gameIds } = req.body;

    const event = await Event.findByPk(id);

    if (!event) {
      res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
      return;
    }

    await event.update({
      name: name || event.name,
      date: date || event.date,
      description: description !== undefined ? description : event.description,
      location: location !== undefined ? location : event.location,
      seasonId: seasonId || event.seasonId,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : event.maxParticipants
    });

    // Update game associations if provided
    if (gameIds && Array.isArray(gameIds)) {
      await EventGame.destroy({ where: { eventId: event.id } });
      for (const gameId of gameIds) {
        await EventGame.create({ eventId: event.id, gameId });
      }
    }

    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        { model: Season, as: 'season' },
        { model: Game, as: 'games' }
      ]
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Greska pri azuriranju dogadjaja.' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
      return;
    }

    await event.destroy();

    res.json({ message: 'Dogadjaj uspesno obrisan.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Greska pri brisanju dogadjaja.' });
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { selectedGame } = req.body;
    const userId = req.userId!;

    const event = await Event.findByPk(id, {
      include: [{ model: Registration, as: 'registrations' }]
    });

    if (!event) {
      res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
      return;
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      where: { userId, eventId: id }
    });

    if (existingRegistration) {
      res.status(400).json({ message: 'Vec ste prijavljeni na ovaj dogadjaj.' });
      return;
    }

    // Check max participants
    if (event.maxParticipants) {
      const currentRegistrations = await Registration.count({
        where: { eventId: id, status: { [Op.ne]: 'cancelled' } }
      });
      if (currentRegistrations >= event.maxParticipants) {
        res.status(400).json({ message: 'Dogadjaj je popunjen.' });
        return;
      }
    }

    const registration = await Registration.create({
      userId,
      eventId: parseInt(id),
      status: 'confirmed',
      selectedGame
    });

    res.status(201).json({ message: 'Uspesno ste se prijavili.', registration });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Greska pri prijavi na dogadjaj.' });
  }
};

export const unregisterFromEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const registration = await Registration.findOne({
      where: { userId, eventId: id }
    });

    if (!registration) {
      res.status(404).json({ message: 'Niste prijavljeni na ovaj dogadjaj.' });
      return;
    }

    await registration.destroy();

    res.json({ message: 'Uspesno ste se odjavili sa dogadjaja.' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Greska pri odjavi sa dogadjaja.' });
  }
};
