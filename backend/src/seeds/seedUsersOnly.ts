import User, { UserRole } from '../models/User';
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

    console.log('\n--- Seed completed! ---');
    console.log('Existing data (events, games, etc.) was NOT deleted.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedUsersOnly();
