import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'OWNER') {
        setError('Access denied. This portal is for stadium owners only.');
        return;
      }
      login(user, token);
      navigate('/stadiums');
    } catch (err) {
      setError(getApiError(err, 'Invalid credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 bg-gradient-to-br from-[#0b1812] via-[#0e1f15] to-[#0a1510] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-[30%] -right-[15%] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(22,163,74,0.07)_0%,transparent_65%)]" />
      <div className="absolute -bottom-[25%] -left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(15,118,53,0.09)_0%,transparent_65%)]" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-[3.25rem] font-black tracking-tighter text-[#f0fdf4] leading-none mb-1">
            KO<span className="text-[#4ade80]">A</span>S
          </h1>
          <p className="text-xs font-bold text-[#4b6358] tracking-[0.15em] uppercase mt-1.5">
            Owner Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111f17] border border-[#1e3326] rounded-[18px] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          <h2 className="text-[1.375rem] font-bold text-[#e2f0e8] tracking-tight mb-1.5">Welcome back</h2>
          <p className="text-sm text-[#4b6358] mb-7 -mt-2">
            Sign in to manage your stadiums and bookings.
          </p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3.5 mb-4 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[#9ab8a4] mb-1.5">Email address</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="owner@turf.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#9ab8a4]">Password</label>
                <a href="#" className="text-xs text-[#4ade80] font-semibold no-underline hover:text-[#86efac] hover:underline">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 mt-2 bg-gradient-to-br from-[#16a34a] to-[#15803d] border-none rounded-[10px] text-white text-[0.9375rem] font-bold cursor-pointer transition-all shadow-[0_4px_14px_rgba(22,163,74,0.25)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(22,163,74,0.35)] active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.25)] border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in to Dashboard'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-[#4b6358]">
              New owner?{' '}
              <Link to="/register" className="text-[#4ade80] font-semibold no-underline hover:text-[#86efac] hover:underline">Create an account</Link>
            </p>
          </div>
        </div>

        {/* Trust */}
        <div className="text-center mt-7">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.18)] rounded-full text-xs font-semibold text-[#4ade80]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure · Verified Turf Owners Only
          </span>
        </div>
      </div>
    </div>
  );
}
