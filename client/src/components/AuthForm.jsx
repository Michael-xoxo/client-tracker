import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const handleToggleMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card" aria-labelledby="auth-heading">
      <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegister}
          className={!isRegister ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => handleToggleMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegister}
          className={isRegister ? 'toggle-btn active' : 'toggle-btn'}
          onClick={() => handleToggleMode('register')}
        >
          Register
        </button>
      </div>

      <h2 id="auth-heading">{isRegister ? 'Create an Account' : 'Sign In'}</h2>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            spellCheck="false"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Login'}
        </button>
      </form>
    </section>
  );
}
