import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RegistrationAttributes {
  id: number;
  userId: number;
  eventId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RegistrationCreationAttributes extends Optional<RegistrationAttributes, 'id'> {}

class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes> implements RegistrationAttributes {
  public id!: number;
  public userId!: number;
  public eventId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Registration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'registrations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'eventId']
      }
    ]
  }
);

export default Registration;
