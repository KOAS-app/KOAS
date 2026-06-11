import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';
import { useAuth } from '../context/AuthContext';
import { getActiveTier, getTrialDaysRemaining, isTrialActive, TIER_LIMITS } from '../utils/tier';
import StadiumModal from '../components/StadiumModal';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalSlots: number;
  availableSlots: number;
  totalReviews: number;
  averageRating: number;
}

interface BankAccount {
  id: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const activeTier = getActiveTier(user);
  const trialDays = getTrialDaysRemaining(user);
  const isTrial = isTrialActive(user);

  const [locationsCount, setLocationsCount] = useState(0);
  const [banksCount, setBanksCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const stadiumRes = await api.get('/stadiums/my');
      const stadiumData = stadiumRes.data[0] || null;
      setStadium(stadiumData);

      if (stadiumData) {
        const [bookingsRes, slotsRes, reviewsRes] = await Promise.all([
          api.get(`/bookings/stadium/${stadiumData.id}`),
          api.get(`/slots/${stadiumData.id}`),
          api.get(`/reviews/stadium/${stadiumData.id}`),
        ]);

        const bookings = bookingsRes.data;
        const slots = slotsRes.data;
        const reviewsData = reviewsRes.data;

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
          totalSlots: slots.length,
          availableSlots: slots.filter((s: any) => !s.isBooked).length,
          totalReviews: reviewsData.totalReviews || 0,
          averageRating: reviewsData.averageRating || 0,
        });
      }
    } catch (err) {
      setError(getApiError(err, 'Failed to load dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchUsageMetrics = async () => {
      try {
        const stadiumRes = await api.get('/stadiums/my');
        const stadiumData: Stadium = stadiumRes.data[0];
        if (stadiumData && stadiumData.locations) {
          setLocationsCount(stadiumData.locations.length);
        }

        const banksRes = await api.get('/bank-accounts/my');
        const banks: BankAccount[] = banksRes.data;
        if (banks) {
          setBanksCount(banks.length);
        }

        const plansRes = await api.get('/subscription-plans/my');
        const plansData: any[] = plansRes.data;
        if (plansData) {
          setPlansCount(plansData.length);
        }
      } catch (err) {
        console.error('Failed to load usage metrics:', err);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchUsageMetrics();
  }, []);

  const handleSaved = () => {
    setModalOpen(false);
    fetchDashboard();
  };

  const limits = TIER_LIMITS[activeTier];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3.5 py-20">
        <div className="inline-block w-[1.625rem] h-[1.625rem] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-muted)] text-sm font-medium">
          Loading dashboard…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3.5 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-12 shadow-sm text-center">
          <div className="text-6xl mb-6 opacity-50">🏟️</div>
          <h2 className="text-xl font-bold text-[var(--color-text-base)] mb-3">
            Welcome to KOAS Owner Portal
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
            Get started by registering your stadium. You'll be able to manage time slots, 
            accept bookings, and respond to reviews all in one place.
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] text-[0.9375rem] font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
            onClick={() => setModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Your Stadium
          </button>
        </div>

        {modalOpen && (
          <StadiumModal
            stadium={null}
            onClose={() => setModalOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </div>
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const firstLocationImage = stadium.locations?.[0]?.images?.[0];
  const imageUrl = firstLocationImage ? `${apiUrl}${firstLocationImage}` : null;

  return (
    <div>
      {stadium.isBlocked && (
        <div className="flex items-start gap-3 px-5 py-4 mb-6 rounded-[12px] bg-red-50 border border-red-200">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-extrabold text-red-800">Your stadium has been blocked</p>
            <p className="text-[0.8125rem] text-red-700 mt-0.5 leading-relaxed">
              {stadium.blockedReason || 'No reason provided.'}
            </p>
            <p className="text-[0.75rem] text-red-500 mt-1.5 font-medium">
              Your stadium is currently hidden from players. Contact support if you believe this is an error.
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Dashboard
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Overview of your stadium performance and activity.
          </p>
        </div>
      </div>

      {/* Stadium Info Card */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6">
          {imageUrl ? (
            <div className="w-32 h-32 rounded-[10px] overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
              <img 
                src={imageUrl} 
                alt={stadium.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-[10px] flex-shrink-0 bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center">
              <span className="text-5xl opacity-30">🏟️</span>
            </div>
          )}

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text-base)] mb-2">
                  {stadium.name}
                </h2>
                <div className="flex items-center gap-3 text-[0.8125rem] text-[var(--color-text-muted)] mb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {stadium.locations.map(l => l.name).join(' • ') || 'No locations'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${
                    stadium.isApproved 
                      ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]' 
                      : 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]'
                  }`}>
                    {stadium.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Stadium
              </button>
            </div>

            {stadium.description && (
              <p className="text-[0.8125rem] text-[var(--color-text-muted)] leading-relaxed mb-3">
                {stadium.description}
              </p>
            )}

            {stadium.amenities && stadium.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stadium.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-[0.6875rem] font-semibold bg-[var(--color-success-bg)] text-[#15803d] border border-[#bbf7d0]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
            label="Total Bookings"
            value={stats.totalBookings}
            subtext={`${stats.pendingBookings} pending`}
            onClick={() => navigate('/bookings')}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
            label="Time Slots"
            value={stats.totalSlots}
            subtext={`${stats.availableSlots} available`}
            onClick={() => navigate('/slots')}
          />
          <StatCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
            label="Reviews"
            value={stats.totalReviews}
            subtext={stats.totalReviews > 0 ? `${stats.averageRating.toFixed(1)} avg rating` : 'No reviews yet'}
            onClick={() => navigate('/reviews')}
          />
        </div>
      )}



      {/* Trial Countdown or Active Banner */}
      {isTrial ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2d1a] to-[#022c22] border border-[#22c55e]/30 rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-[#22c55e]/15 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-3xl animate-bounce">
              👑
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                14-Day Free Trial Active
                <span className="text-[10px] bg-[#22c55e] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Elite Unlocked
                </span>
              </h3>
              <p className="text-sm text-[#a7f3d0] mt-1 leading-relaxed max-w-xl">
                You are currently in your trial period. All Elite features are fully unlocked! Your trial will automatically transition to your registered plan afterwards.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-center bg-[#0c1a12]/60 border border-[#22c55e]/20 px-5 py-3.5 rounded-xl min-w-[140px]">
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Remaining Time</p>
            <p className="text-3xl font-black text-[#4ade80] tracking-tight mt-1">{trialDays} Days</p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary-bg)] border border-[#bbf7d0] flex items-center justify-center text-3xl">
              ⚽
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--color-text-base)] tracking-tight">
                Active Subscription: <span className="text-[var(--color-primary)]">{activeTier}</span>
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Your stadium is running with the standard limits of the {activeTier.toLowerCase()} tier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Usage & Limits Gating Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Turf Locations Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {metricsLoading ? '...' : locationsCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxLocations === Infinity ? 'Unlimited' : limits.maxLocations}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxLocations === Infinity ? 'Elite' : `${limits.maxLocations} Allowed`}
            </div>
          </div>
          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                locationsCount >= limits.maxLocations && limits.maxLocations !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxLocations === Infinity ? '100%' : `${Math.min(100, (locationsCount / limits.maxLocations) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxLocations === Infinity 
              ? 'Enjoy unrestricted branch creations across any city or region.'
              : `${limits.maxLocations - locationsCount} branch slots remaining before hitting plan threshold.`}
          </p>
        </div>

        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Integrated Banks Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {metricsLoading ? '...' : banksCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxBankAccounts === Infinity ? 'Unlimited' : limits.maxBankAccounts}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxBankAccounts === Infinity ? 'Elite' : `${limits.maxBankAccounts} Allowed`}
            </div>
          </div>
          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                banksCount >= limits.maxBankAccounts && limits.maxBankAccounts !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxBankAccounts === Infinity ? '100%' : `${Math.min(100, (banksCount / limits.maxBankAccounts) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxBankAccounts === Infinity 
              ? 'Receive payments directly to any dynamic bank setup without limits.'
              : `${limits.maxBankAccounts - banksCount} account slots remaining before hitting plan threshold.`}
          </p>
        </div>

        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Membership Plans Limit</p>
              <h4 className="text-2xl font-black text-[var(--color-text-base)] mt-1">
                {metricsLoading ? '...' : plansCount} <span className="text-sm font-semibold text-[var(--color-text-muted)]">/ {limits.maxPlayerSubscriptionPlans === Infinity ? 'Unlimited' : limits.maxPlayerSubscriptionPlans}</span>
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
              {limits.maxPlayerSubscriptionPlans === Infinity ? 'Elite' : `${limits.maxPlayerSubscriptionPlans} Allowed`}
            </div>
          </div>
          <div className="w-full bg-[var(--color-border)] h-2.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                plansCount >= limits.maxPlayerSubscriptionPlans && limits.maxPlayerSubscriptionPlans !== Infinity
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{
                width: limits.maxPlayerSubscriptionPlans === Infinity ? '100%' : `${Math.min(100, (plansCount / limits.maxPlayerSubscriptionPlans) * 100)}%`
              }}
            />
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)]">
            {limits.maxPlayerSubscriptionPlans === Infinity 
              ? 'Offer unlimited diverse passes and bundles to target different player groups.'
              : `${limits.maxPlayerSubscriptionPlans - plansCount} membership plan slots remaining before hitting plan threshold.`}
          </p>
        </div>
      </div>

      {/* Subscription Support Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1a12] to-[#0f1e15] border border-[rgba(22,163,74,0.15)] rounded-2xl p-6 md:p-8 shadow-lg mb-6">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#16a34a]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              🛡️ Subscription Renewal & Upgrade Assistance
            </h3>
            <p className="text-xs text-[#a7f3d0] mt-1.5 leading-relaxed max-w-2xl">
              We process subscription activations manually via secure local transfers. To upgrade your plan, request custom features, or clear bank detail limits instantly, please contact our support team.
            </p>
          </div>
          <div className="relative" ref={contactRef}>
            <button
              onClick={() => setContactOpen(!contactOpen)}
              className="w-full md:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-[#064e3b] bg-[#4ade80] hover:bg-[#6ee7b7] transition-all whitespace-nowrap shadow-md shadow-[#4ade80]/20 cursor-pointer border-none gap-2"
            >
              Contact Support
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${contactOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {contactOpen && (
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-64 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50">
                <a
                  href="mailto:koasmeda21@gmail.com"
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors no-underline border-b border-[var(--color-border)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-[var(--color-text-base)]">By Email</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">koasmeda21@gmail.com</div>
                  </div>
                </a>
                <a
                  href="tel:0981559200"
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors no-underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-[var(--color-text-base)]">By Phone</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">0981559200</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <StadiumModal
          stadium={stadium}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-bg)] border border-[#bbf7d0] flex items-center justify-center text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
      <p className="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-[var(--color-text-base)] mb-1">
        {value}
      </p>
      <p className="text-[0.75rem] text-[var(--color-text-muted)]">
        {subtext}
      </p>
    </button>
  );
}

