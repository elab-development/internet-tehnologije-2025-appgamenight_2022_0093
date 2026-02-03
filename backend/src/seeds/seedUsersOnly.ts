import User, { UserRole } from '../models/User';
import { Season } from '../models';
import sequelize from '../config/database';

async function seedUsersOnly() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const plainPassword = 'password123';

    // Helper function to create user if not exists
    const createUserIfNotExists = async (userData: {
      username: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`User ${userData.email} already exists, skipping...`);
        return existing;
      }
      const user = await User.create(userData);
      console.log(`Created user: ${userData.email}`);
      return user;
    };

    // Helper function to create season if not exists
    const createSeasonIfNotExists = async (seasonData: {
      name: string;
      startDate: Date;
      endDate: Date;
    }) => {
      const existing = await Season.findOne({ where: { name: seasonData.name } });
      if (existing) {
        console.log(`Season ${seasonData.name} already exists, skipping...`);
        return existing;
      }
      const season = await Season.create(seasonData);
      console.log(`Created season: ${seasonData.name}`);
      return season;
    };

    // Create users (without deleting existing data)
    console.log('\n--- Creating users ---');
    await createUserIfNotExists({
      username: 'admin',
      email: 'admin@gamenight.com',
      password: plainPassword,
      role: 'admin' as UserRole
    });

    await createUserIfNotExists({
      username: 'marko',
      email: 'marko@example.com',
      password: plainPassword,
      role: 'player' as UserRole
    });

    await createUserIfNotExists({
      username: 'ana',
      email: 'ana@example.com',
      password: plainPassword,
      role: 'player' as UserRole
    });

    await createUserIfNotExists({
      username: 'petar',
      email: 'petar@example.com',
      password: plainPassword,
      role: 'player' as UserRole
    });

    await createUserIfNotExists({
      username: 'gost',
      email: 'gost@example.com',
      password: plainPassword,
      role: 'guest' as UserRole
    });

    // Create seasons (without deleting existing data)
    console.log('\n--- Creating seasons ---');
    await createSeasonIfNotExists({
      name: 'Zimska Sezona 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31')
    });

    await createSeasonIfNotExists({
      name: 'Prolecna Sezona 2024',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30')
    });

    await createSeasonIfNotExists({
      name: 'Prolecna Sezona 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30')
    });

    await createSeasonIfNotExists({
      name: 'Letnja Sezona 2026',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-09-30')
    });

    console.log('\n--- Seed completed! ---');
    console.log('Existing data (events, games, etc.) was NOT deleted.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedUsersOnly();
