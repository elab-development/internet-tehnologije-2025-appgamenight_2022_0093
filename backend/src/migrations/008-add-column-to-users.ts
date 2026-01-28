import { QueryInterface, DataTypes } from 'sequelize';

// Migration Type 2: Adding a new column to an existing table
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'avatar', {
    type: DataTypes.STRING(255),
    allowNull: true,
    after: 'role'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('users', 'avatar');
}
