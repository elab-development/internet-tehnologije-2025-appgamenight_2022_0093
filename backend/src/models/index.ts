import User from './User';
import Game from './Game';
import Event from './Event';
import Match from './Match';
import Registration from './Registration';

// User - Registration (One-to-Many)
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Match (One-to-Many, as winner)
User.hasMany(Match, { foreignKey: 'winnerId', as: 'wins' });
Match.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

// Game - Event (One-to-Many)
Game.hasMany(Event, { foreignKey: 'gameId', as: 'events' });
Event.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Game - Match (One-to-Many)
Game.hasMany(Match, { foreignKey: 'gameId', as: 'matches' });
Match.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Event - Registration (One-to-Many)
Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Event - Match (One-to-Many)
Event.hasMany(Match, { foreignKey: 'eventId', as: 'matches' });
Match.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

export {
  User,
  Game,
  Event,
  Match,
  Registration
};
