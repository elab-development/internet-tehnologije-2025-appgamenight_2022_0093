import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface EventGameAttributes {
  eventId: number;
  gameId: number;
}

class EventGame extends Model<EventGameAttributes> implements EventGameAttributes {
  public eventId!: number;
  public gameId!: number;
}

EventGame.init(
  {
    eventId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'games',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'event_games',
    timestamps: false
  }
);

export default EventGame;
