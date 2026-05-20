import { useState, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import logoDark from '../assets/logo/koas_logo_dark.png';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';
  const plansInfo: Record<string, { name: string; price: string }> = {
    starter: { name: 'Kickoff Starter', price: '1,000 ETB/mo' },
    pro: { name: 'Pro Turf Master', price: '2,500 ETB/mo' },
    elite: { name: 'Elite Arena Complex', price: '5,000 ETB/mo' }
  };
  const planDetails = plansInfo[plan.toLowerCase()] || plansInfo.starter;

  const [form, setForm]       = useState({ name: '', email: '', phoneNumber: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address (e.g., owner@turf.com).';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailError = validateEmail(form.email);
    if (emailError) { setError(emailError); return; }

    const passwordError = validatePassword(form.password);
    if (passwordError) { setError(passwordError); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!form.phoneNumber.match(/^\+251[79]\d{8}$/)) { setError('Phone number must be in Ethiopian format: +251XXXXXXXXX'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, phoneNumber: form.phoneNumber, password: form.password, 
        role: 'OWNER', subscriptionPlan: plan.toUpperCase()
      });
      setSuccess(res.data.message || 'Registration successful. Pending admin approval.');
    } catch (err) {
      setError(getApiError(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center px-4 sm:px-6 md:px-8 relative">
      <div className="w-full max-w-[440px] relative z-10">

        {/* Main card */}
        <div className="bg-gradient-to-b from-[#111819] to-[#0d0f11] border border-[#1f2d2a] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-[1.625rem] font-bold text-white tracking-tight">Create an account</h2>
            <p className="text-sm text-[#9ca3af] mt-1">
              Join KOAS and start accepting bookings
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

          {success ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-[#16a34a]/20 text-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#16a34a]/30">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Registration Submitted</h3>
              <p className="text-sm text-[#9ca3af] mb-8 leading-relaxed">
                {success} We will notify you once your account has been reviewed.
              </p>
              <Link to="/login" className="inline-block w-full px-6 py-3 bg-[#1f2d2a] hover:bg-[#2d3d37] text-white text-sm font-semibold rounded-lg transition-colors border border-[#2d3d37]">
                Return to Sign in
              </Link>
            </div>
          ) : (
            <>
              {/* Selected Plan Summary Badge */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#16a34a]/10 to-[#10b981]/5 border border-[#16a34a]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider block">Selected Plan</span>
                  <span className="text-sm font-extrabold text-white">{planDetails.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#4ade80] block">{planDetails.price}</span>
                  <Link to="/#pricing" className="text-[10px] text-[#9ca3af] hover:text-[#4ade80] underline">Change Plan</Link>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name field */}
            <div>
              <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                Full name
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="owner@turf.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Phone Number field */}
            <div>
              <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="+251XXXXXXXXX"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Password fields - two column on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#d1d5db] mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirm"
                  className="w-full px-4 py-3 bg-[#0f1413] border border-[#1f2d2a] rounded-lg text-white text-sm outline-none transition-all duration-200 placeholder:text-[#4b5563] hover:border-[#2d3d37] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 focus:bg-[#0f1413] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sign up button */}
            <button
              type="submit"
              className="w-full px-6 py-3 mt-4 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#16a34a]/25 hover:shadow-lg hover:shadow-[#16a34a]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-[#16a34a] flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                    <path d="M9 2.756a9.971 9.971 0 0 1 12.224 5.858" />
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1f2d2a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gradient-to-b from-[#111819] to-[#0d0f11] text-[#6b7280]">or</span>
            </div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm text-[#9ca3af]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#4ade80] font-semibold no-underline transition-colors hover:text-[#86efac]">
                Sign in
              </Link>
            </p>
          </div>
            </>
          )}
        </div>

        {/* Legal text and trust */}
        <div className="text-center mt-8 px-4">
          <p className="text-xs text-[#6b7280] leading-relaxed mb-4">
            By registering you agree to our{' '}
            <a href="#" className="text-[#4ade80] hover:text-[#86efac] font-semibold no-underline transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#4ade80] hover:text-[#86efac] font-semibold no-underline transition-colors">Privacy Policy</a>.
          </p>
          <div className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.2)] backdrop-blur-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-xs font-medium text-[#10b981]">
              Secure registration for verified owners
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
