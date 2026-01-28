import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ScoreboardPage from './pages/ScoreboardPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageGames from './pages/admin/ManageGames';
import EnterResults from './pages/admin/EnterResults';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Ucitavanje...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 bg-light">
        {children}
      </main>
      <footer className="bg-dark text-light py-3 text-center">
        <small>&copy; 2024 Game Night. Sva prava zadrzana.</small>
      </footer>
    </div>
  );
};

// Main App Component
const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/games"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <ManageGames />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <EnterResults />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="container py-5 text-center">
              <h1>404</h1>
              <p>Stranica nije pronadjena.</p>
              <a href="/" className="btn btn-primary">
                Nazad na pocetnu
              </a>
            </div>
          }
        />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
