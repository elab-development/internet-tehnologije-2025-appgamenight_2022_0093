import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Stats {
  totalWins: number;
  eventsAttended: number;
  winsPerGame: Array<{
    gameId: number;
    game: { id: number; name: string };
    dataValues: { wins: string };
  }>;
  recentMatches: Array<{
    id: number;
    playedAt: string;
    game: { id: number; name: string };
    event: { id: number; name: string };
  }>;
  upcomingRegistrations: Array<{
    id: number;
    event: { id: number; name: string; date: string; location?: string };
  }>;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
    }

    const fetchStats = async () => {
      try {
        const response = await usersAPI.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('Nova lozinka mora imati najmanje 6 karaktera.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Lozinke se ne poklapaju.');
        return;
      }
      if (!formData.currentPassword) {
        setError('Unesite trenutnu lozinku.');
        return;
      }
    }

    setSaving(true);

    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await usersAPI.updateProfile(updateData);
      updateUser(response.data.user);
      setSuccess('Profil uspesno azuriran.');
      setEditing(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greska pri azuriranju profila.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Chart.js data for wins per game
  const chartData = {
    labels: stats?.winsPerGame?.map((item) => item.game.name) || [],
    datasets: [
      {
        label: 'Pobede',
        data: stats?.winsPerGame?.map((item) => parseInt(item.dataValues.wins)) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Pobede po igrama'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Moj profil</h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        <Col lg={4} className="mb-4">
          {/* Profile Info */}
          <Card>
            <h5>Podaci o nalogu</h5>
            {editing ? (
              <Form>
                <InputField
                  label="Korisnicko ime"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <hr />
                <p className="text-muted small">Ostavite prazno ako ne zelite da promenite lozinku</p>
                <InputField
                  label="Trenutna lozinka"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <InputField
                  label="Nova lozinka"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <InputField
                  label="Potvrdi novu lozinku"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="d-flex gap-2 mt-3">
                  <Button variant="primary" onClick={handleSave} loading={saving}>
                    Sacuvaj
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Odustani
                  </Button>
                </div>
              </Form>
            ) : (
              <>
                <p className="mb-2">
                  <strong>Korisnicko ime:</strong> {user.username}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="mb-3">
                  <strong>Uloga:</strong>{' '}
                  <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                    {user.role === 'admin' ? 'Administrator' : user.role === 'player' ? 'Igrac' : 'Gost'}
                  </Badge>
                </p>
                <Button variant="outline-primary" onClick={() => setEditing(true)}>
                  Izmeni profil
                </Button>
              </>
            )}
          </Card>
        </Col>

        <Col lg={8}>
          {/* Statistics */}
          <Row className="mb-4">
            <Col sm={6} className="mb-3">
              <Card className="text-center h-100">
                <h2 className="mb-0 text-primary">
                  {loading ? '...' : stats?.totalWins || 0}
                </h2>
                <p className="text-muted mb-0">Ukupno pobeda</p>
              </Card>
            </Col>
            <Col sm={6} className="mb-3">
              <Card className="text-center h-100">
                <h2 className="mb-0 text-success">
                  {loading ? '...' : stats?.eventsAttended || 0}
                </h2>
                <p className="text-muted mb-0">Posecenih dogadjaja</p>
              </Card>
            </Col>
          </Row>

          {/* Chart.js - Wins per Game */}
          {stats?.winsPerGame && stats.winsPerGame.length > 0 && (
            <Card className="mb-4">
              <Bar data={chartData} options={chartOptions} />
            </Card>
          )}

          {/* Upcoming Events */}
          {stats?.upcomingRegistrations && stats.upcomingRegistrations.length > 0 && (
            <Card className="mb-4">
              <h5>Predstojeci dogadjaji</h5>
              <ListGroup variant="flush">
                {stats.upcomingRegistrations.map((reg) => (
                  <ListGroup.Item
                    key={reg.id}
                    className="d-flex justify-content-between align-items-center px-0"
                  >
                    <div>
                      <strong>{reg.event.name}</strong>
                      <br />
                      <small className="text-muted">
                        {formatDate(reg.event.date)}
                        {reg.event.location && ` - ${reg.event.location}`}
                      </small>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/events/${reg.event.id}`)}
                    >
                      Detalji
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {/* Recent Matches */}
          {stats?.recentMatches && stats.recentMatches.length > 0 && (
            <Card>
              <h5>Nedavne pobede</h5>
              <ListGroup variant="flush">
                {stats.recentMatches.map((match) => (
                  <ListGroup.Item key={match.id} className="px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Badge bg="success" className="me-2">Pobeda</Badge>
                        <span>{match.game.name}</span>
                        <span className="text-muted ms-2">na {match.event.name}</span>
                      </div>
                      <small className="text-muted">{formatDate(match.playedAt)}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
