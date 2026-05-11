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
        setError('Access denied. This portal is for admins only.');
        return;
      }
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--color-primary)' }}>
            KO<span style={{ color: 'var(--color-accent)' }}>A</span>S
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Admin Dashboard</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text-base)' }}>
            Admin Sign In
          </h2>

          {error && (
            <div className="text-sm px-3 py-2 rounded mb-4"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="admin@koas.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
