import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: number;
  name: string;
  date: Date;
  description?: string;
  location?: string;
  seasonId: number;
  maxParticipants?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'description' | 'location' | 'maxParticipants'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public name!: string;
  public date!: Date;
  public description?: string;
  public location?: string;
  public seasonId!: number;
  public maxParticipants?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'seasons',
        key: 'id'
      }
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: true
  }
);

export default Event;
