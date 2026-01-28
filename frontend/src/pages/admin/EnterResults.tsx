import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, gamesAPI, matchesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

interface Event {
  id: number;
  name: string;
  date: string;
}

interface Game {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

interface Match {
  id: number;
  playedAt: string;
  roundNumber?: number;
  notes?: string;
  winner: { id: number; username: string };
  game: { id: number; name: string };
  event: { id: number; name: string };
}

const EnterResults: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    eventId: '',
    gameId: '',
    winnerId: '',
    roundNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, gamesRes, usersRes, matchesRes] = await Promise.all([
        eventsAPI.getAll(),
        gamesAPI.getAll(),
        usersAPI.getAll(),
        matchesAPI.getAll({ limit: 20 })
      ]);

      setEvents(eventsRes.data);
      setGames(gamesRes.data);
      setUsers(usersRes.data);
      setRecentMatches(matchesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      eventId: events.length > 0 ? String(events[0].id) : '',
      gameId: games.length > 0 ? String(games[0].id) : '',
      winnerId: '',
      roundNumber: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');

    if (!formData.eventId || !formData.gameId || !formData.winnerId) {
      setError('Dogadjaj, igra i pobednik su obavezni.');
      return;
    }

    setSaving(true);

    try {
      await matchesAPI.create({
        eventId: parseInt(formData.eventId),
        gameId: parseInt(formData.gameId),
        winnerId: parseInt(formData.winnerId),
        roundNumber: formData.roundNumber ? parseInt(formData.roundNumber) : undefined,
        notes: formData.notes || undefined
      });

      setSuccess('Rezultat uspesno unesen!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri unosu rezultata.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMatch) return;

    setSaving(true);
    try {
      await matchesAPI.delete(selectedMatch.id);
      setSuccess('Rezultat uspesno obrisan.');
      setShowDeleteModal(false);
      setSelectedMatch(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri brisanju.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) return null;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Unos Rezultata</h2>
        <Button variant="primary" onClick={openCreateModal}>
          + Novi Rezultat
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card title="Nedavni Rezultati">
            {loading ? (
              <p className="text-center">Ucitavanje...</p>
            ) : recentMatches.length > 0 ? (
              <ListGroup variant="flush">
                {recentMatches.map((match) => (
                  <ListGroup.Item
                    key={match.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{match.winner.username}</strong>
                      <span className="text-muted ms-2">
                        pobedio u {match.game.name}
                      </span>
                      <br />
                      <small className="text-muted">
                        {match.event.name}
                        {match.roundNumber && ` - Runda ${match.roundNumber}`}
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-3">
                        {formatDate(match.playedAt)}
                      </small>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(match);
                          setShowDeleteModal(true);
                        }}
                      >
                        Obrisi
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted text-center mb-0">Nema unetih rezultata.</p>
            )}
          </Card>
        </Col>

        <Col lg={4}>
          <Card title="Brzi Unos">
            <p className="text-muted small mb-3">
              Kliknite na dugme iznad da unesete novi rezultat partije.
            </p>

            <h6>Statistika</h6>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between px-0">
                <span>Ukupno partija</span>
                <Badge bg="primary">{recentMatches.length}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between px-0">
                <span>Dogadjaja</span>
                <Badge bg="secondary">{events.length}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between px-0">
                <span>Igara</span>
                <Badge bg="info">{games.length}</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Create Result Modal */}
      <Modal
        show={showModal}
        title="Unos Novog Rezultata"
        onCancel={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText="Sacuvaj"
        loading={saving}
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Dogadjaj *</Form.Label>
            <Form.Select
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              required
            >
              <option value="">Izaberite dogadjaj</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({formatDate(event.date)})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Igra *</Form.Label>
            <Form.Select
              name="gameId"
              value={formData.gameId}
              onChange={handleChange}
              required
            >
              <option value="">Izaberite igru</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pobednik *</Form.Label>
            <Form.Select
              name="winnerId"
              value={formData.winnerId}
              onChange={handleChange}
              required
            >
              <option value="">Izaberite pobednika</option>
              {users
                .filter((u) => u.username !== 'admin')
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Broj runde (opciono)</Form.Label>
            <Form.Control
              type="number"
              name="roundNumber"
              value={formData.roundNumber}
              onChange={handleChange}
              min={1}
              placeholder="npr. 1, 2, 3..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Napomena (opciono)</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Dodatne informacije o partiji..."
            />
          </Form.Group>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        title="Potvrda brisanja"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Obrisi"
        confirmVariant="danger"
        loading={saving}
      >
        <p>
          Da li ste sigurni da zelite da obrisete ovaj rezultat?
        </p>
        {selectedMatch && (
          <p className="text-muted mb-0">
            <strong>{selectedMatch.winner.username}</strong> - pobeda u{' '}
            {selectedMatch.game.name}
          </p>
        )}
      </Modal>
    </Container>
  );
};

export default EnterResults;
