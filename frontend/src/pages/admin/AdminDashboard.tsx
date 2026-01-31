import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI, gamesAPI, usersAPI, matchesAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Stats {
  totalEvents: number;
  totalGames: number;
  totalUsers: number;
  totalMatches: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalGames: 0,
    totalUsers: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [events, games, users, matches] = await Promise.all([
          eventsAPI.getAll(),
          gamesAPI.getAll(),
          usersAPI.getAll(),
          matchesAPI.getAll()
        ]);

        setStats({
          totalEvents: events.data.length,
          totalGames: games.data.length,
          totalUsers: users.data.length,
          totalMatches: matches.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats */}
      <Row className="mb-5">
        <Col sm={6} md={3} className="mb-3">
          <Card className="text-center h-100">
            <h2 className="mb-0 text-primary">
              {loading ? '...' : stats.totalEvents}
            </h2>
            <p className="text-muted mb-0">Događaja</p>
          </Card>
        </Col>
        <Col sm={6} md={3} className="mb-3">
          <Card className="text-center h-100">
            <h2 className="mb-0 text-success">
              {loading ? '...' : stats.totalGames}
            </h2>
            <p className="text-muted mb-0">Igara</p>
          </Card>
        </Col>
        <Col sm={6} md={3} className="mb-3">
          <Card className="text-center h-100">
            <h2 className="mb-0 text-info">
              {loading ? '...' : stats.totalUsers}
            </h2>
            <p className="text-muted mb-0">Korisnika</p>
          </Card>
        </Col>
        <Col sm={6} md={3} className="mb-3">
          <Card className="text-center h-100">
            <h2 className="mb-0 text-warning">
              {loading ? '...' : stats.totalMatches}
            </h2>
            <p className="text-muted mb-0">Partija</p>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <h4 className="mb-3">Brze akcije</h4>
      <Row>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <h5>Upravljanje događajima</h5>
            <p className="text-muted">
              Kreirajte, izmenite ili obrišite događaje.
            </p>
            <Link to="/admin/events">
              <Button variant="primary">Otvori</Button>
            </Link>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <h5>Upravljanje igrama</h5>
            <p className="text-muted">
              Dodajte nove igre ili izmenite postojeće.
            </p>
            <Link to="/admin/games">
              <Button variant="success">Otvori</Button>
            </Link>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <h5>Unos rezultata</h5>
            <p className="text-muted">
              Unesite rezultate odigranih partija.
            </p>
            <Link to="/admin/results">
              <Button variant="warning">Otvori</Button>
            </Link>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
