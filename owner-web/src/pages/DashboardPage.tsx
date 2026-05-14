import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';
import StadiumModal from '../components/StadiumModal';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalSlots: number;
  availableSlots: number;
  totalReviews: number;
  averageRating: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      // Fetch stadium
      const stadiumRes = await api.get('/stadiums/my');
      const stadiumData = stadiumRes.data[0] || null;
      setStadium(stadiumData);

      if (stadiumData) {
        // Fetch stats in parallel
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

  const handleSaved = () => {
    setModalOpen(false);
    fetchDashboard();
  };

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

  // No stadium - show onboarding
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
  const imageUrl = stadium.imageUrl ? `${apiUrl}${stadium.imageUrl}` : null;

  return (
    <div>
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
        <div className="flex items-start gap-6 p-6">
          {/* Stadium Image */}
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

          {/* Stadium Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text-base)] mb-2">
                  {stadium.name}
                </h2>
                <div className="flex items-center gap-3 text-[0.8125rem] text-[var(--color-text-muted)] mb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {stadium.locations.join(' • ')}
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

            {/* Amenities */}
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
        <div className="grid grid-cols-3 gap-5 mb-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-5">
        <QuickActionCard
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          title="Manage Time Slots"
          description="Create and manage available booking slots"
          buttonText="Go to Slots"
          onClick={() => navigate('/slots')}
        />
        <QuickActionCard
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
          title="View Bookings"
          description="Review and manage player bookings"
          buttonText="Go to Bookings"
          onClick={() => navigate('/bookings')}
        />
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

/* ─── Sub-components ─────────────────────────────────────────── */
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

function QuickActionCard({ icon, title, description, buttonText, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-bg)] border border-[#bbf7d0] flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-base)] mb-1">
            {title}
          </h3>
          <p className="text-[0.8125rem] text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
      >
        {buttonText}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
