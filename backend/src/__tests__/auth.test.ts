import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Create a minimal test app
const app = express();
app.use(cors());
app.use(express.json());

// Mock auth routes for testing without database
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Sva polja su obavezna.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Lozinka mora imati najmanje 6 karaktera.' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Neispravan email format.' });
  }

  return res.status(201).json({
    message: 'Registracija uspesna.',
    user: { id: 1, username, email, role: 'player' },
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email i lozinka su obavezni.' });
  }

  if (email === 'admin@gamenight.com' && password === 'password123') {
    return res.json({
      message: 'Prijava uspesna.',
      user: { id: 1, username: 'admin', email, role: 'admin' },
      token: 'mock-jwt-token'
    });
  }

  return res.status(401).json({ message: 'Pogresni podaci za prijavu.' });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Pristup odbijen. Token nije pronadjen.' });
  }
  return res.json({
    user: { id: 1, username: 'admin', email: 'admin@gamenight.com', role: 'admin' }
  });
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('testuser');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gamenight.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('admin');
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gamenight.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('username');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
