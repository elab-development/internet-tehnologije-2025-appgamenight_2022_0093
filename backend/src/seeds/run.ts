import { User, Game, Event, Match, Registration } from '../models';
import sequelize from '../config/database';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Clear existing data
    await Match.destroy({ where: {} });
    await Registration.destroy({ where: {} });
    await Event.destroy({ where: {} });
    await Game.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create Users (password will be hashed by model hook)
    const plainPassword = 'password123';

    const admin = await User.create({
      username: 'admin',
      email: 'admin@gamenight.com',
      password: plainPassword,
      role: 'admin'
    });

    const player1 = await User.create({
      username: 'marko',
      email: 'marko@example.com',
      password: plainPassword,
      role: 'player'
    });

    const player2 = await User.create({
      username: 'ana',
      email: 'ana@example.com',
      password: plainPassword,
      role: 'player'
    });

    const player3 = await User.create({
      username: 'petar',
      email: 'petar@example.com',
      password: plainPassword,
      role: 'player'
    });

    const guest = await User.create({
      username: 'gost',
      email: 'gost@example.com',
      password: plainPassword,
      role: 'guest'
    });

    console.log('Users created.');

    // Create Games
    const catan = await Game.create({
      name: 'Catan',
      minPlayers: 3,
      maxPlayers: 4,
      description: 'Strateska igra trgovine i gradnje'
    });

    const ticket = await Game.create({
      name: 'Ticket to Ride',
      minPlayers: 2,
      maxPlayers: 5,
      description: 'Igra gradnje zeleznickih ruta'
    });

    const carcassonne = await Game.create({
      name: 'Carcassonne',
      minPlayers: 2,
      maxPlayers: 5,
      description: 'Igra polaganja plocica i kontrole teritorije'
    });

    const azul = await Game.create({
      name: 'Azul',
      minPlayers: 2,
      maxPlayers: 4,
      description: 'Apstraktna strateska igra sa plocicama'
    });

    console.log('Games created.');

    // Create Events (each event has one game)
    const event1 = await Event.create({
      name: 'Game Night #1 - Catan',
      date: new Date('2024-01-15 18:00:00'),
      description: 'Prva game night sezone! Dobrodosli svi igraci.',
      location: 'Beograd',
      gameId: catan.id,
      maxParticipants: 20
    });

    const event2 = await Event.create({
      name: 'Ticket to Ride Turnir',
      date: new Date('2024-02-10 17:00:00'),
      description: 'Specijalni Ticket to Ride turnir sa nagradama.',
      location: 'Novi Sad',
      gameId: ticket.id,
      maxParticipants: 16
    });

    const event3 = await Event.create({
      name: 'Carcassonne Vece',
      date: new Date('2026-04-20 18:00:00'),
      description: 'Prolecno okupljanje - Carcassonne partije!',
      location: 'Beograd',
      gameId: carcassonne.id,
      maxParticipants: 24
    });

    const event4 = await Event.create({
      name: 'Azul Sampionat',
      date: new Date('2026-05-15 17:00:00'),
      description: 'Veliki Azul sampionat - ko ce biti najbolji?',
      location: 'Nis',
      gameId: azul.id,
      maxParticipants: 12
    });

    console.log('Events created.');

    // Create Registrations
    await Registration.create({ userId: player1.id, eventId: event1.id });
    await Registration.create({ userId: player2.id, eventId: event1.id });
    await Registration.create({ userId: player3.id, eventId: event1.id });
    await Registration.create({ userId: player1.id, eventId: event2.id });
    await Registration.create({ userId: player2.id, eventId: event2.id });
    await Registration.create({ userId: player1.id, eventId: event3.id });
    await Registration.create({ userId: player3.id, eventId: event3.id });
    await Registration.create({ userId: admin.id, eventId: event3.id });

    console.log('Registrations created.');

    // Create Matches (results)
    await Match.create({
      eventId: event1.id,
      gameId: catan.id,
      winnerId: player1.id,
      playedAt: new Date('2024-01-15 19:30:00')
    });

    await Match.create({
      eventId: event1.id,
      gameId: catan.id,
      winnerId: player3.id,
      playedAt: new Date('2024-01-15 21:00:00')
    });

    await Match.create({
      eventId: event2.id,
      gameId: ticket.id,
      winnerId: player2.id,
      playedAt: new Date('2024-02-10 18:00:00')
    });

    await Match.create({
      eventId: event2.id,
      gameId: ticket.id,
      winnerId: player1.id,
      playedAt: new Date('2024-02-10 19:30:00')
    });

    await Match.create({
      eventId: event2.id,
      gameId: ticket.id,
      winnerId: player1.id,
      playedAt: new Date('2024-02-10 21:00:00')
    });

    console.log('Matches created.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
