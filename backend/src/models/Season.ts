import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SeasonAttributes {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SeasonCreationAttributes extends Optional<SeasonAttributes, 'id'> {}

class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  public id!: number;
  public name!: string;
  public startDate!: Date;
  public endDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Season.init(
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
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'seasons',
    timestamps: true
  }
);

export default Season;
