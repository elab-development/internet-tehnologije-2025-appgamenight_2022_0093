import request from 'supertest';
import express from 'express';

// Create a minimal test app with mock game routes
const app = express();
app.use(express.json());

let games = [
  { id: 1, name: 'Catan', minPlayers: 3, maxPlayers: 4, description: 'Strateska igra' },
  { id: 2, name: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5, description: 'Igra vozova' }
];
let nextId = 3;

app.get('/api/games', (_req, res) => {
  res.json(games);
});

app.get('/api/games/:id', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) return res.status(404).json({ message: 'Igra nije pronadjena.' });
  return res.json(game);
});

app.post('/api/games', (req, res) => {
  const { name, minPlayers, maxPlayers, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Naziv igre je obavezan.' });
  if (minPlayers && maxPlayers && minPlayers > maxPlayers) {
    return res.status(400).json({ message: 'Min ne moze biti veci od max.' });
  }
  const game = { id: nextId++, name, minPlayers: minPlayers || 2, maxPlayers: maxPlayers || 4, description };
  games.push(game);
  return res.status(201).json(game);
});

app.put('/api/games/:id', (req, res) => {
  const game = games.find(g => g.id === parseInt(req.params.id));
  if (!game) return res.status(404).json({ message: 'Igra nije pronadjena.' });
  Object.assign(game, req.body);
  return res.json(game);
});

app.delete('/api/games/:id', (req, res) => {
  const index = games.findIndex(g => g.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Igra nije pronadjena.' });
  games.splice(index, 1);
  return res.json({ message: 'Igra uspesno obrisana.' });
});

describe('Games API', () => {
  beforeEach(() => {
    games = [
      { id: 1, name: 'Catan', minPlayers: 3, maxPlayers: 4, description: 'Strateska igra' },
      { id: 2, name: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5, description: 'Igra vozova' }
    ];
    nextId = 3;
  });

  describe('GET /api/games', () => {
    it('should return all games', async () => {
      const res = await request(app).get('/api/games');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/games/:id', () => {
    it('should return game by id', async () => {
      const res = await request(app).get('/api/games/1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Catan');
    });

    it('should return 404 for non-existent game', async () => {
      const res = await request(app).get('/api/games/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/games', () => {
    it('should create a new game', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ name: 'Azul', minPlayers: 2, maxPlayers: 4 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Azul');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ minPlayers: 2 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/games/:id', () => {
    it('should delete a game', async () => {
      const res = await request(app).delete('/api/games/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('obrisana');
    });

    it('should return 404 for non-existent game', async () => {
      const res = await request(app).delete('/api/games/999');
      expect(res.status).toBe(404);
    });
  });
});
