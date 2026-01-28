import User from './User';
import Season from './Season';
import Game from './Game';
import Event from './Event';
import Match from './Match';
import Registration from './Registration';
import EventGame from './EventGame';

// User - Registration (One-to-Many)
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Match (One-to-Many, as winner)
User.hasMany(Match, { foreignKey: 'winnerId', as: 'wins' });
Match.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

// Season - Event (One-to-Many)
Season.hasMany(Event, { foreignKey: 'seasonId', as: 'events' });
Event.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

// Event - Registration (One-to-Many)
Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Event - Match (One-to-Many)
Event.hasMany(Match, { foreignKey: 'eventId', as: 'matches' });
Match.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Game - Match (One-to-Many)
Game.hasMany(Match, { foreignKey: 'gameId', as: 'matches' });
Match.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// Event - Game (Many-to-Many through EventGame)
Event.belongsToMany(Game, { through: EventGame, foreignKey: 'eventId', as: 'games' });
Game.belongsToMany(Event, { through: EventGame, foreignKey: 'gameId', as: 'events' });

// Registration - Game (selected game)
Registration.belongsTo(Game, { foreignKey: 'selectedGame', as: 'preferredGame' });

export {
  User,
  Season,
  Game,
  Event,
  Match,
  Registration,
  EventGame
};
