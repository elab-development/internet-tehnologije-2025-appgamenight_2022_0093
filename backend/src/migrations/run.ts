import sequelize from '../config/database';

const migrations = [
  require('./001-create-users'),
  require('./002-create-games'),
  require('./003-create-events'),
  require('./004-create-matches'),
  require('./005-create-registrations'),
  require('./006-add-column-to-users'),
  require('./007-modify-column-events')
];

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const queryInterface = sequelize.getQueryInterface();

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`Running migration ${i + 1}...`);
      await migration.up(queryInterface);
      console.log(`Migration ${i + 1} completed.`);
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
