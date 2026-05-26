import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import officialLogo from '../assets/logo/koas_official_logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#050a08] via-[#0a1110] to-[#070c0a] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Very subtle accent glow - minimal, sophisticated */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-[0.03] blur-3xl bg-gradient-to-r from-[#3b82f6] via-transparent to-transparent" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo and branding */}
        <div className="flex flex-col items-center justify-center mb-6">
          <img src={officialLogo} alt="KOAS Logo" className="w-28 h-28 object-contain " />
        </div>

        {/* Main card */}
        <div className="bg-gradient-to-b from-[#111819] to-[#0d0f11] border border-[#1f2d2a] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-[1.625rem] font-bold text-white tracking-tight">Admin Access</h2>
            <p className="text-sm text-[#9ca3af] mt-1">
              Sign in to the admin portal
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 mb-6 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] animate-in fade-in slide-in-from-top-2 duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#fca5a5]">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                Email address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#3b82f6] focus:ring ring-[#3b82f6]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@koas.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Password field with visibility toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#d1d5db]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#3b82f6] focus:ring ring-[#3b82f6]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#6b7280] hover:text-[#d1d5db] transition-colors disabled:opacity-50"
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="w-full px-6 py-3 mt-2 bg-[#3b82f6] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#3b82f6]/25 hover:shadow-lg hover:shadow-[#3b82f6]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-[#3b82f6] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                    <path d="M9 2.756a9.971 9.971 0 0 1 12.224 5.858" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1f2d2a]" />
            </div>
          </div>
        </div>

        {/* Trust indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-8 px-4 py-3 rounded-lg bg-[rgba(59,130,246,0.04)] border border-[rgba(59,130,246,0.2)] backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-xs font-medium text-[#0ea5e9]">
            Secure admin platform · Encrypted connection
          </span>
        </div>
      </div>
    </div>
  );
}
