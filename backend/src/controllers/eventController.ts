import { Request, Response } from 'express';
import { Event, Game, Registration, User, Match } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import { Op } from 'sequelize';

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const where: any = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const events = await Event.findAll({
      where,
      include: [
        { model: Game, as: 'game', attributes: ['id', 'name'] },
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
        { model: Game, as: 'game' },
        {
          model: Registration,
          as: 'registrations',
          include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }
          ]
        },
        {
          model: Match,
          as: 'matches',
          include: [
            { model: User, as: 'winner', attributes: ['id', 'username'] },
            { model: Game, as: 'game', attributes: ['id', 'name'] }
          ],
          order: [['playedAt', 'DESC']]
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
    const { name, date, description, location, gameId, maxParticipants } = req.body;

    if (!name || !date || !gameId) {
      res.status(400).json({ message: 'Naziv, datum i igra su obavezni.' });
      return;
    }

    const game = await Game.findByPk(gameId);
    if (!game) {
      res.status(400).json({ message: 'Igra ne postoji.' });
      return;
    }

    const event = await Event.create({
      name,
      date,
      description,
      location,
      gameId,
      maxParticipants
    });

    const createdEvent = await Event.findByPk(event.id, {
      include: [{ model: Game, as: 'game' }]
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
    const { name, date, description, location, gameId, maxParticipants } = req.body;

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
      gameId: gameId || event.gameId,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : event.maxParticipants
    });

    const updatedEvent = await Event.findByPk(event.id, {
      include: [{ model: Game, as: 'game' }]
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
    const userId = req.userId!;

    const event = await Event.findByPk(id);

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
        where: { eventId: id }
      });
      if (currentRegistrations >= event.maxParticipants) {
        res.status(400).json({ message: 'Dogadjaj je popunjen.' });
        return;
      }
    }

    const registration = await Registration.create({
      userId,
      eventId: parseInt(id)
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
