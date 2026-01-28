import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, gamesAPI, scoreboardAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';

interface Event {
  id: number;
  name: string;
  date: string;
  location?: string;
  seasonId: number;
  maxParticipants?: number;
  description?: string;
}

interface Game {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

const ManageEvents: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    seasonId: '',
    maxParticipants: '',
    gameIds: [] as number[]
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
      const [eventsRes, gamesRes, seasonsRes] = await Promise.all([
        eventsAPI.getAll(),
        gamesAPI.getAll(),
        scoreboardAPI.getSeasons()
      ]);
      setEvents(eventsRes.data);
      setGames(gamesRes.data);
      setSeasons(seasonsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGameSelect = (gameId: number) => {
    setFormData((prev) => ({
      ...prev,
      gameIds: prev.gameIds.includes(gameId)
        ? prev.gameIds.filter((id) => id !== gameId)
        : [...prev.gameIds, gameId]
    }));
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      seasonId: seasons.length > 0 ? String(seasons[0].id) : '',
      maxParticipants: '',
      gameIds: []
    });
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location || '',
      description: event.description || '',
      seasonId: String(event.seasonId),
      maxParticipants: event.maxParticipants ? String(event.maxParticipants) : '',
      gameIds: []
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        date: formData.date,
        location: formData.location || undefined,
        description: formData.description || undefined,
        seasonId: parseInt(formData.seasonId),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        gameIds: formData.gameIds.length > 0 ? formData.gameIds : undefined
      };

      if (selectedEvent) {
        await eventsAPI.update(selectedEvent.id, data);
        setSuccess('Dogadjaj uspesno azuriran.');
      } else {
        await eventsAPI.create(data);
        setSuccess('Dogadjaj uspesno kreiran.');
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri cuvanju.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    setSaving(true);
    try {
      await eventsAPI.delete(selectedEvent.id);
      setSuccess('Dogadjaj uspesno obrisan.');
      setShowDeleteModal(false);
      setSelectedEvent(null);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) return null;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Upravljanje Dogadjajima</h2>
        <Button variant="primary" onClick={openCreateModal}>
          + Novi Dogadjaj
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card>
        {loading ? (
          <p className="text-center">Ucitavanje...</p>
        ) : (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Datum</th>
                <th>Lokacija</th>
                <th>Max. Ucenika</th>
                <th style={{ width: '150px' }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>{event.location || '-'}</td>
                  <td>{event.maxParticipants || 'Neograniceno'}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => openEditModal(event)}
                    >
                      Izmeni
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDeleteModal(true);
                      }}
                    >
                      Obrisi
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        title={selectedEvent ? 'Izmeni Dogadjaj' : 'Novi Dogadjaj'}
        onCancel={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText="Sacuvaj"
        loading={saving}
        size="lg"
      >
        <Form>
          <Row>
            <Col md={6}>
              <InputField
                label="Naziv"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Datum i vreme"
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <InputField
                label="Lokacija"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Max. ucenika"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={1}
              />
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Sezona</Form.Label>
            <Form.Select
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              required
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <InputField
            label="Opis"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
          <Form.Group className="mb-3">
            <Form.Label>Igre na dogadjaju</Form.Label>
            <div>
              {games.map((game) => (
                <Form.Check
                  key={game.id}
                  inline
                  type="checkbox"
                  label={game.name}
                  checked={formData.gameIds.includes(game.id)}
                  onChange={() => handleGameSelect(game.id)}
                />
              ))}
            </div>
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
          Da li ste sigurni da zelite da obrisete dogadjaj{' '}
          <strong>{selectedEvent?.name}</strong>?
        </p>
        <p className="text-muted mb-0">Ova akcija se ne moze ponistiti.</p>
      </Modal>
    </Container>
  );
};

export default ManageEvents;
