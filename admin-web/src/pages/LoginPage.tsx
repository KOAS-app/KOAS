import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'ADMIN') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err, 'Invalid credentials. Please try again.'));
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
          <p className="auth-logo-subtitle">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-card-title">Admin Access</h2>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="admin@koas.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="auth-input" 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Secure access · Platform administration
          </p>
          <div className="auth-trust-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" fill="currentColor"/>
            </svg>
            Protected by encryption
          </div>
        </div>
      </div>
    </div>
  );
}
