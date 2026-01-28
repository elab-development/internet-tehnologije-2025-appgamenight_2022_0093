import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GameAttributes {
  id: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id' | 'description'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
  public id!: number;
  public name!: string;
  public minPlayers!: number;
  public maxPlayers!: number;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    minPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'games',
    timestamps: true
  }
);

export default Game;
