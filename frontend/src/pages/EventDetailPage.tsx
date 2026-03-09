import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Alert, ListGroup, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, matchesAPI, externalAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Registration {
  id: number;
  user: { id: number; username: string; avatar?: string };
}

interface Match {
  id: number;
  playedAt: string;
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
  gameId: number;
  game?: { id: number; name: string };
  registrations?: Registration[];
  matches?: Match[];
}

interface Weather {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin: enter results
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [savingResult, setSavingResult] = useState(false);

  const isRegistered = event?.registrations?.some(
    (r) => r.user.id === user?.id
  );

  const isUpcoming = event ? new Date(event.date) >= new Date() : false;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const eventRes = await eventsAPI.getById(parseInt(id));
        setEvent(eventRes.data);

        // Fetch weather for event location
        if (eventRes.data.location) {
          try {
            const city = eventRes.data.location.split(',')[0].trim();
            const weatherRes = await externalAPI.getWeather(city);
            setWeather(weatherRes.data);
          } catch {
            // Weather API might fail, that's ok
          }
        }
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
      await eventsAPI.register(parseInt(id));
      setSuccess('Uspesno ste se prijavili na dogadjaj!');

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

      const response = await eventsAPI.getById(parseInt(id));
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri odjavi.');
    } finally {
      setRegistering(false);
    }
  };

  const handleSaveResult = async () => {
    if (!id || !selectedWinner || !event) return;

    setSavingResult(true);
    setError('');
    setSuccess('');

    try {
      await matchesAPI.create({
        eventId: parseInt(id),
        gameId: event.gameId,
        winnerId: parseInt(selectedWinner),
        playedAt: new Date().toISOString()
      });
      setSuccess('Rezultat uspesno sacuvan!');
      setSelectedWinner('');

      // Refresh event data
      const response = await eventsAPI.getById(parseInt(id));
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri cuvanju rezultata.');
    } finally {
      setSavingResult(false);
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
                {event.game && (
                  <Badge bg="info" className="me-2">{event.game.name}</Badge>
                )}
              </div>
              <Badge bg={isUpcoming ? 'success' : 'secondary'} className="fs-6">
                {isUpcoming ? 'Predstojeci' : 'Zavrsen'}
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
          </Card>

          {/* Weather */}
          {weather && (
            <Card className="mb-4">
              <h5>Vremenska prognoza - {weather.city}</h5>
              <div className="d-flex align-items-center">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  width={64}
                  height={64}
                />
                <div className="ms-3">
                  <h3 className="mb-0">{weather.temperature}°C</h3>
                  <p className="text-muted mb-0 text-capitalize">{weather.description}</p>
                  <small className="text-muted">
                    Vlaznost: {weather.humidity}% | Vetar: {weather.windSpeed} m/s
                  </small>
                </div>
              </div>
            </Card>
          )}

          {/* Matches */}
          {event.matches && event.matches.length > 0 && (
            <Card className="mb-4">
              <h5>Rezultati partija</h5>
              <ListGroup variant="flush">
                {event.matches.map((match) => (
                  <ListGroup.Item
                    key={match.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{match.winner.username}</strong>
                      <span className="text-muted ms-2">
                        pobedio u {match.game.name}
                      </span>
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

          {/* Admin: Enter Results */}
          {isAdmin && (
            <Card className="mb-4">
              <h5>Unos rezultata</h5>
              {isUpcoming && (
                <Alert variant="warning" className="mb-0">
                  Rezultati se mogu unositi tek nakon sto se dogadjaj zavrsi.
                </Alert>
              )}
              {!isUpcoming && event.registrations && event.registrations.length > 0 ? (
                <div className="d-flex gap-2 align-items-end">
                  <Form.Group className="flex-grow-1">
                    <Form.Label>Pobednik</Form.Label>
                    <Form.Select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                    >
                      <option value="">Izaberite pobednika...</option>
                      {event.registrations.map((reg) => (
                        <option key={reg.user.id} value={reg.user.id}>
                          {reg.user.username}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleSaveResult}
                    loading={savingResult}
                    disabled={!selectedWinner}
                  >
                    Sacuvaj
                  </Button>
                </div>
              ) : (
                !isUpcoming && <p className="text-muted mb-0">Nema prijavljenih igraca.</p>
              )}
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Registration Card */}
          <Card className="mb-4">
            <h5>Prijava</h5>
            <p className="mb-2">
              <strong>Prijavljeno:</strong>{' '}
              {event.registrations?.length || 0}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} igraca
            </p>

            {isAuthenticated && isUpcoming && (
              <>
                {!isRegistered ? (
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleRegister}
                    loading={registering}
                  >
                    Prijavi se
                  </Button>
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
          <Card>
            <h5>Prijavljeni igraci</h5>
            {event.registrations && event.registrations.length > 0 ? (
              <ListGroup variant="flush">
                {event.registrations.map((reg) => (
                  <ListGroup.Item
                    key={reg.id}
                    className="d-flex align-items-center px-0"
                  >
                    <span>{reg.user.username}</span>
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
