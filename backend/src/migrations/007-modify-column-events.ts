import { QueryInterface, DataTypes } from 'sequelize';

// Migration Type 3: Modifying an existing column
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Change description from VARCHAR(255) to TEXT for longer descriptions
  await queryInterface.changeColumn('events', 'description', {
    type: DataTypes.TEXT,
    allowNull: true
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Revert back to VARCHAR(255)
  await queryInterface.changeColumn('events', 'description', {
    type: DataTypes.STRING(255),
    allowNull: true
  });
}
