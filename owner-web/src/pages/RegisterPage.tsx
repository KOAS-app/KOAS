import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: 'OWNER',
      });
      login(res.data.user, res.data.token);
      navigate('/stadiums');
    } catch (err) {
      setError(getApiError(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 bg-gradient-to-br from-[#0b1812] via-[#0e1f15] to-[#0a1510] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-[30%] -right-[15%] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(22,163,74,0.07)_0%,transparent_65%)]" />
      <div className="absolute -bottom-[25%] -left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(15,118,53,0.09)_0%,transparent_65%)]" />

      <div className="w-full max-w-[460px] relative z-10">
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
          <h2 className="text-[1.375rem] font-bold text-[#e2f0e8] tracking-tight mb-1.5">Create an account</h2>
          <p className="text-sm text-[#4b6358] mb-7 -mt-2">
            Register your turf and start accepting bookings.
          </p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3.5 mb-4 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[#9ab8a4] mb-1.5">Full name</label>
              <input
                name="name" type="text"
                className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ahmed Hassan"
                value={form.name} onChange={handleChange}
                required autoFocus disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[#9ab8a4] mb-1.5">Email address</label>
              <input
                name="email" type="email"
                className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="owner@turf.com"
                value={form.email} onChange={handleChange}
                required disabled={loading}
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[#9ab8a4] mb-1.5">Password</label>
                <input
                  name="password" type="password"
                  className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  required minLength={6} disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[#9ab8a4] mb-1.5">Confirm</label>
                <input
                  name="confirm" type="password"
                  className="w-full px-4 py-3 bg-[#162b1e] border-[1.5px] border-[#1e3326] rounded-[10px] text-[#e2f0e8] text-[0.9375rem] outline-none transition-all placeholder:text-[#4b6358] hover:border-[rgba(22,163,74,0.35)] focus:border-[#16a34a] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-[#1a3024] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={form.confirm} onChange={handleChange}
                  required disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 mt-2 bg-gradient-to-br from-[#16a34a] to-[#15803d] border-none rounded-[10px] text-white text-[0.9375rem] font-bold cursor-pointer transition-all shadow-[0_4px_14px_rgba(22,163,74,0.25)] hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(22,163,74,0.35)] active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block w-4 h-4 border-2 border-[rgba(255,255,255,0.25)] border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Register as Turf Owner'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-[#4b6358]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#4ade80] font-semibold no-underline hover:text-[#86efac] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-7">
          <p className="text-xs text-[#2e4a38] max-w-[320px] mx-auto leading-relaxed">
            By registering you agree to our{' '}
            <a href="#" className="text-[#4ade80] hover:text-[#86efac]">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#4ade80] hover:text-[#86efac]">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
