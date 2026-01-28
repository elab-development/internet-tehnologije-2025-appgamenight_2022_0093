import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('event_games', {
    eventId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'events',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'games',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('event_games');
}
