import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useDebounce } from '../hooks/useFetch';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface Event {
  id: number;
  name: string;
  date: string;
  description?: string;
  location?: string;
  maxParticipants?: number;
  game?: { id: number; name: string };
  registrations?: { id: number; user: { username: string } }[];
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await eventsAPI.getAll(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
      <h2 className="mb-4">Dogadjaji</h2>

      {/* Search Filter */}
      <Card className="mb-4">
        <Row className="align-items-end">
          <Col md={9} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Pretraga</Form.Label>
              <Form.Control
                type="text"
                placeholder="Pretrazite dogadjaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              Resetuj
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Events List */}
      {loading ? (
        <p className="text-center">Ucitavanje...</p>
      ) : events.length > 0 ? (
        <Row>
          {events.map((event) => (
            <Col md={6} lg={4} key={event.id} className="mb-4">
              <Card className="h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{event.name}</h5>
                  <Badge bg={isUpcoming(event.date) ? 'success' : 'secondary'}>
                    {isUpcoming(event.date) ? 'Predstojeci' : 'Zavrsen'}
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

                {event.game && (
                  <div className="mb-3">
                    <Badge bg="info">{event.game.name}</Badge>
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
            {searchTerm
              ? 'Nema dogadjaja koji odgovaraju pretrazi.'
              : 'Nema dostupnih dogadjaja.'}
          </p>
        </Card>
      )}
    </Container>
  );
};

export default EventsPage;
