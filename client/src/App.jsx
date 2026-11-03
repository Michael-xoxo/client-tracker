import { useContext, useEffect, useState } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import ProjectDashboard from './components/ProjectDashboard';
import { AuthContext, AuthProvider, useAuth } from './context/AuthContext';

function Dashboard() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const [sessionState, setSessionState] = useState({
    token: null,
    status: 'idle',
    profile: null,
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    let cancelled = false;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        if (!res.ok) {
          throw new Error('Failed to verify session');
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data) {
          setSessionState({
            token,
            status: 'confirmed',
            profile: data,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSessionState({
            token,
            status: 'error',
            profile: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, logout]);

  if (!isAuthenticated) {
    return (
      <main className="app-container">
        <header className="brand-header">
          <h1>Client Project Tracker</h1>
        </header>
        <AuthForm />
      </main>
    );
  }

  const isCurrentToken = sessionState.token === token;
  const sessionStatus = isCurrentToken ? sessionState.status : 'verifying';
  const sessionProfile = isCurrentToken ? sessionState.profile : null;

  return (
    <main className="app-container">
      <header className="welcome-header">
        <div className="welcome-info">
          <h1>Welcome, {user.name}</h1>
          <p className="user-meta">
            <span>Email: {user.email}</span>
            <span className="role-badge">Role: {user.role}</span>
            {sessionStatus === 'confirmed' && sessionProfile && (
              <span className="status-ok">
                Active session confirmed via GET /api/auth/me
              </span>
            )}
          </p>
        </div>
        <button type="button" className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <ProjectDashboard />
    </main>
  );
}

export default function App() {
  const existingContext = useContext(AuthContext);
  if (existingContext) {
    return <Dashboard />;
  }
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
