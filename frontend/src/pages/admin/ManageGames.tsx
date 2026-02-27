import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { gamesAPI, externalAPI } from '../../services/api';
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

interface BGGResult {
  bggId: string;
  name: string;
  yearPublished?: string;
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

  // BGG search
  const [bggQuery, setBggQuery] = useState('');
  const [bggResults, setBggResults] = useState<BGGResult[]>([]);
  const [bggLoading, setBggLoading] = useState(false);

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
    setBggResults([]);
    setBggQuery('');
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
    setBggResults([]);
    setBggQuery('');
    setShowModal(true);
  };

  const handleBGGSearch = async () => {
    if (!bggQuery.trim()) return;

    setBggLoading(true);
    try {
      const response = await externalAPI.searchBGG(bggQuery);
      setBggResults(response.data);
    } catch (err) {
      console.error('BGG search error:', err);
    } finally {
      setBggLoading(false);
    }
  };

  const handleBGGSelect = async (bggId: string) => {
    setBggLoading(true);
    try {
      const response = await externalAPI.getBGGDetails(bggId);
      const game = response.data;
      setFormData({
        name: game.name || '',
        minPlayers: String(game.minPlayers || 2),
        maxPlayers: String(game.maxPlayers || 4),
        description: game.description
          ? game.description.replace(/<[^>]*>/g, '').substring(0, 500)
          : ''
      });
      setBggResults([]);
    } catch (err) {
      console.error('BGG details error:', err);
    } finally {
      setBggLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');

    if (parseInt(formData.minPlayers) > parseInt(formData.maxPlayers)) {
      setError('Minimalan broj igraca ne moze biti veci od maksimalnog.');
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
        setSuccess('Igra uspesno azurirana.');
      } else {
        await gamesAPI.create(data);
        setSuccess('Igra uspesno kreirana.');
      }

      setShowModal(false);
      fetchGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri cuvanju.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGame) return;

    setSaving(true);
    try {
      await gamesAPI.delete(selectedGame.id);
      setSuccess('Igra uspesno obrisana.');
      setShowDeleteModal(false);
      setSelectedGame(null);
      fetchGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri brisanju.');
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
          <p className="text-center">Ucitavanje...</p>
        ) : (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Min. igraca</th>
                <th>Max. igraca</th>
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
        title={selectedGame ? 'Izmeni igru' : 'Nova igra'}
        onCancel={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText="Sacuvaj"
        loading={saving}
        size="lg"
      >
        <Form>
          {/* BGG Search */}
          <div className="mb-3 p-3 bg-light rounded">
            <Form.Label className="fw-bold">Pretrazi BoardGameGeek</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Naziv igre na BGG..."
                value={bggQuery}
                onChange={(e) => setBggQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBGGSearch())}
              />
              <Button
                variant="outline-info"
                onClick={handleBGGSearch}
                loading={bggLoading}
              >
                Pretrazi
              </Button>
            </div>
            {bggResults.length > 0 && (
              <ListGroup className="mt-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {bggResults.map((result) => (
                  <ListGroup.Item
                    key={result.bggId}
                    action
                    onClick={() => handleBGGSelect(result.bggId)}
                    className="d-flex justify-content-between"
                  >
                    <span>{result.name}</span>
                    {result.yearPublished && (
                      <small className="text-muted">({result.yearPublished})</small>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          <InputField
            label="Naziv"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Row>
            <Col md={6}>
              <InputField
                label="Minimalan broj igraca"
                type="number"
                name="minPlayers"
                value={formData.minPlayers}
                onChange={handleChange}
                min={1}
                max={20}
                required
              />
            </Col>
            <Col md={6}>
              <InputField
                label="Maksimalan broj igraca"
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                min={1}
                max={20}
                required
              />
            </Col>
          </Row>
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
          Da li ste sigurni da zelite da obrisete igru{' '}
          <strong>{selectedGame?.name}</strong>?
        </p>
        <p className="text-muted mb-0">
          Igra se moze obrisati samo ako nema zapisanih partija.
        </p>
      </Modal>
    </Container>
  );
};

export default ManageGames;
