import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { gamesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';

interface Game {
  id: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  description?: string;
}

const ManageGames: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    minPlayers: '2',
    maxPlayers: '4',
    description: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchGames();
  }, [isAdmin, navigate]);

  const fetchGames = async () => {
    try {
      const response = await gamesAPI.getAll();
      setGames(response.data);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setSelectedGame(null);
    setFormData({
      name: '',
      minPlayers: '2',
      maxPlayers: '4',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (game: Game) => {
    setSelectedGame(game);
    setFormData({
      name: game.name,
      minPlayers: String(game.minPlayers),
      maxPlayers: String(game.maxPlayers),
      description: game.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');

    if (parseInt(formData.minPlayers) > parseInt(formData.maxPlayers)) {
      setError('Minimalan broj igrača ne može biti veći od maksimalnog.');
      return;
    }

    setSaving(true);

    try {
      const data = {
        name: formData.name,
        minPlayers: parseInt(formData.minPlayers),
        maxPlayers: parseInt(formData.maxPlayers),
        description: formData.description || undefined
      };

      if (selectedGame) {
        await gamesAPI.update(selectedGame.id, data);
        setSuccess('Igra uspešno ažurirana.');
      } else {
        await gamesAPI.create(data);
        setSuccess('Igra uspešno kreirana.');
      }

      setShowModal(false);
      fetchGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greška pri čuvanju.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGame) return;

    setSaving(true);
    try {
      await gamesAPI.delete(selectedGame.id);
      setSuccess('Igra uspešno obrisana.');
      setShowDeleteModal(false);
      setSelectedGame(null);
      fetchGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greška pri brisanju.');
      setShowDeleteModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Upravljanje igrama</h2>
        <Button variant="primary" onClick={openCreateModal}>
          + Nova igra
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card>
        {loading ? (
          <p className="text-center">Učitavanje...</p>
        ) : (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Min. igrača</th>
                <th>Max. igrača</th>
                <th>Opis</th>
                <th style={{ width: '150px' }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>{game.name}</td>
                  <td>{game.minPlayers}</td>
                  <td>{game.maxPlayers}</td>
                  <td>
                    {game.description
                      ? game.description.length > 50
                        ? `${game.description.substring(0, 50)}...`
                        : game.description
                      : '-'}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => openEditModal(game)}
                    >
                      Izmeni
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedGame(game);
                        setShowDeleteModal(true);
                      }}
                    >
                      Obriši
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
        title={selectedGame ? 'Izmeni igru' : 'Nova igra'}
        onCancel={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText="Sačuvaj"
        loading={saving}
      >
        <Form>
          <InputField
            label="Naziv"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Minimalan broj igrača"
            type="number"
            name="minPlayers"
            value={formData.minPlayers}
            onChange={handleChange}
            min={1}
            max={20}
            required
          />
          <InputField
            label="Maksimalan broj igrača"
            type="number"
            name="maxPlayers"
            value={formData.maxPlayers}
            onChange={handleChange}
            min={1}
            max={20}
            required
          />
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
        confirmText="Obriši"
        confirmVariant="danger"
        loading={saving}
      >
        <p>
          Da li ste sigurni da želite da obrišete igru{' '}
          <strong>{selectedGame?.name}</strong>?
        </p>
        <p className="text-muted mb-0">
          Igra se može obrisati samo ako nema zapisanih partija.
        </p>
      </Modal>
    </Container>
  );
};

export default ManageGames;
