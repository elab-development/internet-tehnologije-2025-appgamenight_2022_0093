import { User, Season, Game, Event, Match, Registration, EventGame } from '../models';
import sequelize from '../config/database';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Clear existing data
    await Match.destroy({ where: {} });
    await Registration.destroy({ where: {} });
    await EventGame.destroy({ where: {} });
    await Event.destroy({ where: {} });
    await Season.destroy({ where: {} });
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

    // Create Seasons
    const season1 = await Season.create({
      name: 'Zimska Sezona 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31')
    });

    const season2 = await Season.create({
      name: 'Prolecna Sezona 2024',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30')
    });

    const season3 = await Season.create({
      name: 'Prolecna Sezona 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30')
    });

    console.log('Seasons created.');

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

    // Create Events
    const event1 = await Event.create({
      name: 'Game Night #1',
      date: new Date('2024-01-15 18:00:00'),
      description: 'Prva game night sezone! Dobrodosli svi igraci.',
      location: 'Klub Drustvenih Igara, Beograd',
      seasonId: season1.id,
      maxParticipants: 20
    });

    const event2 = await Event.create({
      name: 'Catan Turnir',
      date: new Date('2024-02-10 17:00:00'),
      description: 'Specijalni Catan turnir sa nagradama.',
      location: 'Gaming Cafe, Novi Sad',
      seasonId: season1.id,
      maxParticipants: 16
    });

    const event3 = await Event.create({
      name: 'Game Night #5',
      date: new Date('2024-04-20 18:00:00'),
      description: 'Prolecno okupljanje - nove igre!',
      location: 'Klub Drustvenih Igara, Beograd',
      seasonId: season2.id,
      maxParticipants: 24
    });

    console.log('Events created.');

    // Associate Games with Events
    await EventGame.create({ eventId: event1.id, gameId: catan.id });
    await EventGame.create({ eventId: event1.id, gameId: ticket.id });
    await EventGame.create({ eventId: event1.id, gameId: carcassonne.id });
    await EventGame.create({ eventId: event2.id, gameId: catan.id });
    await EventGame.create({ eventId: event3.id, gameId: azul.id });
    await EventGame.create({ eventId: event3.id, gameId: carcassonne.id });

    console.log('Event-Game associations created.');

    // Create Registrations
    await Registration.create({
      userId: player1.id,
      eventId: event1.id,
      status: 'confirmed',
      selectedGame: catan.id
    });

    await Registration.create({
      userId: player2.id,
      eventId: event1.id,
      status: 'confirmed',
      selectedGame: ticket.id
    });

    await Registration.create({
      userId: player3.id,
      eventId: event1.id,
      status: 'confirmed',
      selectedGame: catan.id
    });

    await Registration.create({
      userId: player1.id,
      eventId: event2.id,
      status: 'confirmed',
      selectedGame: catan.id
    });

    await Registration.create({
      userId: player2.id,
      eventId: event2.id,
      status: 'pending'
    });

    console.log('Registrations created.');

    // Create Matches (results)
    await Match.create({
      eventId: event1.id,
      gameId: catan.id,
      winnerId: player1.id,
      playedAt: new Date('2024-01-15 19:30:00'),
      roundNumber: 1
    });

    await Match.create({
      eventId: event1.id,
      gameId: ticket.id,
      winnerId: player2.id,
      playedAt: new Date('2024-01-15 20:00:00'),
      roundNumber: 1
    });

    await Match.create({
      eventId: event1.id,
      gameId: catan.id,
      winnerId: player3.id,
      playedAt: new Date('2024-01-15 21:00:00'),
      roundNumber: 2
    });

    await Match.create({
      eventId: event2.id,
      gameId: catan.id,
      winnerId: player1.id,
      playedAt: new Date('2024-02-10 18:00:00'),
      roundNumber: 1
    });

    await Match.create({
      eventId: event2.id,
      gameId: catan.id,
      winnerId: player1.id,
      playedAt: new Date('2024-02-10 19:30:00'),
      roundNumber: 2,
      notes: 'Finalna partija turnira'
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
