import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'OWNER',
      });

      const { user, token } = res.data;
      login(user, token);
      navigate('/stadiums');
    } catch (err: unknown) {
      setError(getApiError(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Logo */}
        <div className="auth-logo">
          <h1 className="auth-logo-text">
            KO<span className="auth-logo-accent">A</span>S
          </h1>
          <p className="auth-logo-subtitle">Owner Dashboard</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-card-title">Create your account</h2>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <input
                name="name"
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <input
                name="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input
                name="password"
                type="password"
                className="auth-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Confirm Password</label>
              <input
                name="confirm"
                type="password"
                className="auth-input"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn-content">
                  <div className="auth-spinner"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-link-container">
            <p className="auth-link-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            By creating an account, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
