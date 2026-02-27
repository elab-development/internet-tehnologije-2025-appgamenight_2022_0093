import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, gamesAPI } from '../../services/api';
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
  gameId: number;
  maxParticipants?: number;
  description?: string;
}

interface Game {
  id: number;
  name: string;
}

const ManageEvents: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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
    gameId: '',
    maxParticipants: ''
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
      const [eventsRes, gamesRes] = await Promise.all([
        eventsAPI.getAll(),
        gamesAPI.getAll()
      ]);
      setEvents(eventsRes.data);
      setGames(gamesRes.data);
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

  const openCreateModal = () => {
    setSelectedEvent(null);
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      gameId: games.length > 0 ? String(games[0].id) : '',
      maxParticipants: ''
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
      gameId: String(event.gameId),
      maxParticipants: event.maxParticipants ? String(event.maxParticipants) : ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');

    if (!formData.name || !formData.name.trim()) {
      setError('Naziv je obavezan.');
      return;
    }
    if (!formData.date) {
      setError('Datum je obavezan.');
      return;
    }
    if (!formData.gameId) {
      setError('Igra je obavezna.');
      return;
    }

    setSaving(true);

    try {
      const data = {
        name: formData.name.trim(),
        date: formData.date,
        location: formData.location || undefined,
        description: formData.description || undefined,
        gameId: parseInt(formData.gameId),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
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
        <h2>Upravljanje dogadjajima</h2>
        <Button variant="primary" onClick={openCreateModal}>
          + Novi dogadjaj
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
                <th>Max. ucesnika</th>
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
        title={selectedEvent ? 'Izmeni dogadjaj' : 'Novi dogadjaj'}
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
                label="Max. ucesnika"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min={1}
              />
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Igra</Form.Label>
            <Form.Select
              name="gameId"
              value={formData.gameId}
              onChange={handleChange}
              required
            >
              <option value="">Izaberite igru...</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
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
