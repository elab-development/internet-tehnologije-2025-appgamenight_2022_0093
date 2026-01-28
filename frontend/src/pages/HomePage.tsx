import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { eventsAPI, scoreboardAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

interface Event {
  id: number;
  name: string;
  date: string;
  location?: string;
}

interface ScoreboardEntry {
  rank: number;
  user: { id: number; username: string };
  wins: number;
}

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [topPlayers, setTopPlayers] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, scoreboardRes] = await Promise.all([
          eventsAPI.getAll(),
          scoreboardAPI.get({ limit: 5 })
        ]);

        // Filter upcoming events
        const now = new Date();
        const upcoming = eventsRes.data
          .filter((e: Event) => new Date(e.date) >= now)
          .slice(0, 3);
        setUpcomingEvents(upcoming);

        setTopPlayers(scoreboardRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5 text-center">
        <Col>
          <h1 className="display-4 mb-3">Dobrodosli na Game Night</h1>
          <p className="lead text-muted">
            Platforma za organizaciju turnira i pracenje rezultata drustvenih igara
          </p>
          {!isAuthenticated && (
            <div className="mt-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="me-3">
                  Registruj se
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline-primary" size="lg">
                  Pregledaj Dogadjaje
                </Button>
              </Link>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        {/* Upcoming Events */}
        <Col md={7} className="mb-4">
          <h3 className="mb-4">Predstojeji Dogadjaji</h3>
          {loading ? (
            <p>Ucitavanje...</p>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="mb-3">
                <Row className="align-items-center">
                  <Col>
                    <h5 className="mb-1">{event.name}</h5>
                    <p className="text-muted mb-1">{formatDate(event.date)}</p>
                    {event.location && (
                      <small className="text-muted">{event.location}</small>
                    )}
                  </Col>
                  <Col xs="auto">
                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline-primary" size="sm">
                        Detalji
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-muted mb-0">Nema predstojejcih dogadjaja.</p>
            </Card>
          )}
          <Link to="/events">
            <Button variant="link" className="px-0 mt-2">
              Svi dogadjaji &rarr;
            </Button>
          </Link>
        </Col>

        {/* Top Players */}
        <Col md={5} className="mb-4">
          <h3 className="mb-4">Top Igraci</h3>
          <Card>
            {loading ? (
              <p>Ucitavanje...</p>
            ) : topPlayers.length > 0 ? (
              <div className="list-group list-group-flush">
                {topPlayers.map((entry) => (
                  <div
                    key={entry.user.id}
                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                  >
                    <div>
                      <span className="badge bg-primary me-2">{entry.rank}</span>
                      {entry.user.username}
                    </div>
                    <span className="badge bg-secondary">{entry.wins} pobeda</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">Nema podataka o igracima.</p>
            )}
            <Link to="/scoreboard">
              <Button variant="link" className="px-0 mt-3">
                Kompletna rang lista &rarr;
              </Button>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <h4>Prijavi se na Dogadjaje</h4>
            <p className="text-muted">
              Pregledaj listu predstojejcih game night dogadjaja i prijavi se za
              ucesce.
            </p>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <h4>Prati Rezultate</h4>
            <p className="text-muted">
              Vidi sve rezultate partija i prati ko je najbolji u omiljenim igrama.
            </p>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 text-center">
            <h4>Rang Lista</h4>
            <p className="text-muted">
              Penjaj se na rang listi pobedama u partijama i postani sampion sezone.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
