import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Table, Badge } from 'react-bootstrap';
import { scoreboardAPI, gamesAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface User {
  id: number;
  username: string;
  avatar?: string;
}

interface ScoreboardEntry {
  rank: number;
  user: User;
  wins: number;
  games: { [gameId: number]: number };
}

interface Game {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

const ScoreboardPage: React.FC = () => {
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  const fetchScoreboard = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedGame) params.gameId = selectedGame;
      if (selectedSeason) params.seasonId = selectedSeason;

      const response = await scoreboardAPI.get(params);
      setScoreboard(response.data);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, selectedSeason]);

  useEffect(() => {
    fetchScoreboard();
  }, [fetchScoreboard]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [gamesRes, seasonsRes] = await Promise.all([
          gamesAPI.getAll(),
          scoreboardAPI.getSeasons()
        ]);
        setGames(gamesRes.data);
        setSeasons(seasonsRes.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  const getRankBadgeVariant = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'warning'; // Gold
      case 2:
        return 'secondary'; // Silver
      case 3:
        return 'danger'; // Bronze
      default:
        return 'light';
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '1.';
      case 2:
        return '2.';
      case 3:
        return '3.';
      default:
        return `${rank}.`;
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Rang Lista</h2>

      {/* Filters */}
      <Card className="mb-4">
        <Row className="align-items-end">
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label>Igra</Form.Label>
              <Form.Select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">Sve igre</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </Form.Select>
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
          <Col md={4}>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSelectedGame('');
                setSelectedSeason('');
              }}
            >
              Resetuj filtere
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Scoreboard Table */}
      <Card>
        {loading ? (
          <p className="text-center mb-0">Ucitavanje...</p>
        ) : scoreboard.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rang</th>
                <th>Igrac</th>
                <th className="text-center" style={{ width: '120px' }}>
                  Pobede
                </th>
              </tr>
            </thead>
            <tbody>
              {scoreboard.map((entry) => (
                <tr key={entry.user.id}>
                  <td>
                    <Badge
                      bg={getRankBadgeVariant(entry.rank)}
                      className={entry.rank <= 3 ? 'text-dark' : ''}
                      style={{ fontSize: '1rem', minWidth: '40px' }}
                    >
                      {getRankEmoji(entry.rank)}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {entry.user.avatar ? (
                        <img
                          src={entry.user.avatar}
                          alt={entry.user.username}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <span className="text-white">
                            {entry.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className={entry.rank <= 3 ? 'fw-bold' : ''}>
                        {entry.user.username}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg="primary" style={{ fontSize: '1rem' }}>
                      {entry.wins}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center text-muted mb-0">
            {selectedGame || selectedSeason
              ? 'Nema rezultata za izabrane filtere.'
              : 'Nema podataka na rang listi.'}
          </p>
        )}
      </Card>

      {/* Games Statistics */}
      {!selectedGame && scoreboard.length > 0 && (
        <Row className="mt-4">
          <Col>
            <h4 className="mb-3">Statistika po Igrama</h4>
            <Row>
              {games.slice(0, 4).map((game) => {
                const topPlayer = scoreboard.find(
                  (entry) => entry.games[game.id] && entry.games[game.id] > 0
                );
                const totalWins = scoreboard.reduce(
                  (sum, entry) => sum + (entry.games[game.id] || 0),
                  0
                );

                return (
                  <Col md={3} sm={6} key={game.id} className="mb-3">
                    <Card className="h-100">
                      <h6 className="mb-2">{game.name}</h6>
                      <p className="text-muted mb-1">
                        Ukupno partija: {totalWins}
                      </p>
                      {topPlayer && topPlayer.games[game.id] && (
                        <p className="mb-0">
                          <small>
                            Top igrac: <strong>{topPlayer.user.username}</strong>
                            <Badge bg="success" className="ms-1">
                              {topPlayer.games[game.id]} pobeda
                            </Badge>
                          </small>
                        </p>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ScoreboardPage;
