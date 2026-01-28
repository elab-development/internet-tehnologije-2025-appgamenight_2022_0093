import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MatchAttributes {
  id: number;
  eventId: number;
  gameId: number;
  winnerId: number;
  playedAt: Date;
  roundNumber?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'roundNumber' | 'notes'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: number;
  public eventId!: number;
  public gameId!: number;
  public winnerId!: number;
  public playedAt!: Date;
  public roundNumber?: number;
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    playedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'matches',
    timestamps: true
  }
);

export default Match;
