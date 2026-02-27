import React from 'react';
import { Navbar as BsNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          Game Night
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-navbar" />
        <BsNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Pocetna
            </Nav.Link>
            <Nav.Link as={Link} to="/events">
              Dogadjaji
            </Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/admin/events">
                      Upravljanje dogadjajima
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/games">
                      Upravljanje igrama
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                <NavDropdown title={user?.username || 'Korisnik'} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    Moj profil
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Odjava
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Prijava
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Registracija
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
