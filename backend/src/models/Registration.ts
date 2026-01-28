import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

interface RegistrationAttributes {
  id: number;
  userId: number;
  eventId: number;
  status: RegistrationStatus;
  selectedGame?: number;
  registeredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RegistrationCreationAttributes extends Optional<RegistrationAttributes, 'id' | 'status' | 'selectedGame' | 'registeredAt'> {}

class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes> implements RegistrationAttributes {
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public status!: RegistrationStatus;
  public selectedGame?: number;
  public registeredAt!: Date;

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
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    selectedGame: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    registeredAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
