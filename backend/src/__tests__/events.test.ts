import request from 'supertest';
import express from 'express';

// Create a minimal test app with mock event routes
const app = express();
app.use(express.json());

let events = [
  { id: 1, name: 'Game Night #1', date: '2026-04-15T18:00:00Z', location: 'Beograd', gameId: 1, maxParticipants: 20 },
  { id: 2, name: 'Catan Turnir', date: '2026-05-10T17:00:00Z', location: 'Novi Sad', gameId: 1, maxParticipants: 16 }
];
let nextId = 3;

app.get('/api/events', (req, res) => {
  let result = [...events];
  if (req.query.search) {
    const search = (req.query.search as string).toLowerCase();
    result = result.filter(e => e.name.toLowerCase().includes(search));
  }
  res.json(result);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
  return res.json(event);
});

app.post('/api/events', (req, res) => {
  const { name, date, gameId, location, maxParticipants } = req.body;
  if (!name || !date || !gameId) {
    return res.status(400).json({ message: 'Naziv, datum i igra su obavezni.' });
  }
  const event = { id: nextId++, name, date, gameId, location, maxParticipants };
  events.push(event);
  return res.status(201).json(event);
});

app.delete('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Dogadjaj nije pronadjen.' });
  events.splice(index, 1);
  return res.json({ message: 'Dogadjaj uspesno obrisan.' });
});

describe('Events API', () => {
  beforeEach(() => {
    events = [
      { id: 1, name: 'Game Night #1', date: '2026-04-15T18:00:00Z', location: 'Beograd', gameId: 1, maxParticipants: 20 },
      { id: 2, name: 'Catan Turnir', date: '2026-05-10T17:00:00Z', location: 'Novi Sad', gameId: 1, maxParticipants: 16 }
    ];
    nextId = 3;
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should filter events by search query', async () => {
      const res = await request(app).get('/api/events?search=Catan');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toContain('Catan');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by id', async () => {
      const res = await request(app).get('/api/events/1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Game Night #1');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/api/events/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          name: 'Novo Vece Igara',
          date: '2026-06-01T18:00:00Z',
          gameId: 2,
          location: 'Beograd'
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Novo Vece Igara');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an event', async () => {
      const res = await request(app).delete('/api/events/1');
      expect(res.status).toBe(200);
    });
  });
});
