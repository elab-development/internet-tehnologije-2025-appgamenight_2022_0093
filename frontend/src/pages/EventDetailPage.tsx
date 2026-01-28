import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Alert, ListGroup, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, matchesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Game {
  id: number;
  name: string;
}

interface Registration {
  id: number;
  status: string;
  user: { id: number; username: string; avatar?: string };
  preferredGame?: Game;
}

interface Match {
  id: number;
  playedAt: string;
  roundNumber?: number;
  winner: { id: number; username: string };
  game: { id: number; name: string };
}

interface Event {
  id: number;
  name: string;
  date: string;
  description?: string;
  location?: string;
  maxParticipants?: number;
  season?: { id: number; name: string };
  games?: Game[];
  registrations?: Registration[];
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [selectedGame, setSelectedGame] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isRegistered = event?.registrations?.some(
    (r) => r.user.id === user?.id && r.status !== 'cancelled'
  );

  const isUpcoming = event ? new Date(event.date) >= new Date() : false;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [eventRes, matchesRes] = await Promise.all([
          eventsAPI.getById(parseInt(id)),
          matchesAPI.getAll({ eventId: parseInt(id) })
        ]);
        setEvent(eventRes.data);
        setMatches(matchesRes.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Greska pri ucitavanju dogadjaja.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRegister = async () => {
    if (!id) return;

    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      await eventsAPI.register(parseInt(id), { selectedGame });
      setSuccess('Uspesno ste se prijavili na dogadjaj!');

      // Refresh event data
      const response = await eventsAPI.getById(parseInt(id));
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri prijavi.');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!id) return;

    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      await eventsAPI.unregister(parseInt(id));
      setSuccess('Uspesno ste se odjavili sa dogadjaja.');

      // Refresh event data
      const response = await eventsAPI.getById(parseInt(id));
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri odjavi.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-4">
        <p className="text-center">Ucitavanje...</p>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Dogadjaj nije pronadjen.</Alert>
        <Button onClick={() => navigate('/events')}>Nazad na listu</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="outline-secondary"
        className="mb-3"
        onClick={() => navigate('/events')}
      >
        &larr; Nazad na listu
      </Button>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="mb-1">{event.name}</h2>
                {event.season && (
                  <Badge bg="secondary">{event.season.name}</Badge>
                )}
              </div>
              <Badge bg={isUpcoming ? 'success' : 'secondary'} className="fs-6">
                {isUpcoming ? 'Predstojeji' : 'Zavrsen'}
              </Badge>
            </div>

            <p className="text-muted mb-2">{formatDate(event.date)}</p>

            {event.location && (
              <p className="mb-3">
                <strong>Lokacija:</strong> {event.location}
              </p>
            )}

            {event.description && (
              <div className="mb-3">
                <strong>Opis:</strong>
                <p className="mt-1">{event.description}</p>
              </div>
            )}

            {event.games && event.games.length > 0 && (
              <div className="mb-3">
                <strong>Igre na dogadjaju:</strong>
                <div className="mt-2">
                  {event.games.map((game) => (
                    <Badge key={game.id} bg="info" className="me-2 mb-2">
                      {game.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Matches */}
          {matches.length > 0 && (
            <Card title="Rezultati Partija" className="mb-4">
              <ListGroup variant="flush">
                {matches.map((match) => (
                  <ListGroup.Item
                    key={match.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{match.winner.username}</strong>
                      <span className="text-muted ms-2">
                        pobedio u {match.game.name}
                      </span>
                      {match.roundNumber && (
                        <Badge bg="secondary" className="ms-2">
                          Runda {match.roundNumber}
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted">
                      {new Date(match.playedAt).toLocaleTimeString('sr-RS', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Registration Card */}
          <Card title="Prijava" className="mb-4">
            <p className="mb-2">
              <strong>Prijavljeno:</strong>{' '}
              {event.registrations?.filter((r) => r.status !== 'cancelled').length || 0}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} igraca
            </p>

            {isAuthenticated && isUpcoming && (
              <>
                {!isRegistered ? (
                  <>
                    {event.games && event.games.length > 0 && (
                      <Form.Group className="mb-3">
                        <Form.Label>Preferirana igra (opciono)</Form.Label>
                        <Form.Select
                          value={selectedGame || ''}
                          onChange={(e) =>
                            setSelectedGame(
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                        >
                          <option value="">Bez preferencije</option>
                          {event.games.map((game) => (
                            <option key={game.id} value={game.id}>
                              {game.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handleRegister}
                      loading={registering}
                    >
                      Prijavi se
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline-danger"
                    className="w-100"
                    onClick={handleUnregister}
                    loading={registering}
                  >
                    Odjavi se
                  </Button>
                )}
              </>
            )}

            {!isAuthenticated && isUpcoming && (
              <Alert variant="info" className="mb-0">
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => navigate('/login')}
                >
                  Prijavite se
                </Button>{' '}
                da biste se registrovali za dogadjaj.
              </Alert>
            )}

            {!isUpcoming && (
              <Alert variant="secondary" className="mb-0">
                Ovaj dogadjaj je zavrsen.
              </Alert>
            )}
          </Card>

          {/* Participants List */}
          <Card title="Prijavljeni Igraci">
            {event.registrations && event.registrations.length > 0 ? (
              <ListGroup variant="flush">
                {event.registrations
                  .filter((r) => r.status !== 'cancelled')
                  .map((reg) => (
                    <ListGroup.Item
                      key={reg.id}
                      className="d-flex justify-content-between align-items-center px-0"
                    >
                      <span>{reg.user.username}</span>
                      {reg.preferredGame && (
                        <Badge bg="info" className="ms-2">
                          {reg.preferredGame.name}
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            ) : (
              <p className="text-muted mb-0">Nema prijavljenih igraca.</p>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetailPage;
