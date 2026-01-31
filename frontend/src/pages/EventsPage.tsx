import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { eventsAPI, scoreboardAPI } from '../services/api';
import { useDebounce } from '../hooks/useFetch';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';

interface Event {
  id: number;
  name: string;
  date: string;
  description?: string;
  location?: string;
  maxParticipants?: number;
  season?: { id: number; name: string };
  games?: { id: number; name: string }[];
  registrations?: { id: number; user: { username: string } }[];
}

interface Season {
  id: number;
  name: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedSeason) params.seasonId = selectedSeason;

      const response = await eventsAPI.getAll(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedSeason]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await scoreboardAPI.getSeasons();
        setSeasons(response.data);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    fetchSeasons();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Događaji</h2>

      {/* Filters */}
      <Card className="mb-4">
        <Row className="align-items-end">
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Pretraga</Form.Label>
              <Form.Control
                type="text"
                placeholder="Pretražite događaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Sezona</Form.Label>
              <Form.Select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="">Sve sezone</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedSeason('');
              }}
            >
              Resetuj
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Events List */}
      {loading ? (
        <p className="text-center">Učitavanje...</p>
      ) : events.length > 0 ? (
        <Row>
          {events.map((event) => (
            <Col md={6} lg={4} key={event.id} className="mb-4">
              <Card className="h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{event.name}</h5>
                  <Badge bg={isUpcoming(event.date) ? 'success' : 'secondary'}>
                    {isUpcoming(event.date) ? 'Predstojeći' : 'Završen'}
                  </Badge>
                </div>

                <p className="text-muted mb-2">
                  <small>{formatDate(event.date)}</small>
                </p>

                {event.location && (
                  <p className="mb-2">
                    <small className="text-muted">{event.location}</small>
                  </p>
                )}

                {event.description && (
                  <p className="mb-3">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </p>
                )}

                {event.games && event.games.length > 0 && (
                  <div className="mb-3">
                    {event.games.map((game) => (
                      <Badge key={game.id} bg="info" className="me-1">
                        {game.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <small className="text-muted">
                    {event.registrations?.length || 0}
                    {event.maxParticipants
                      ? ` / ${event.maxParticipants}`
                      : ''}{' '}
                    prijavljenih
                  </small>
                  <Link to={`/events/${event.id}`}>
                    <Button variant="outline-primary" size="sm">
                      Detalji
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center">
          <p className="text-muted mb-0">
            {searchTerm || selectedSeason
              ? 'Nema događaja koji odgovaraju pretrazi.'
              : 'Nema dostupnih događaja.'}
          </p>
        </Card>
      )}
    </Container>
  );
};

export default EventsPage;
