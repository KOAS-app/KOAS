import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { Booking, OwnerStats, BookingInsight, Activity } from '../types';
import ReceiptModal from '../components/bookings/ReceiptModal';
import StatCard from '../components/bookings/StatCard';
import BookingTable from '../components/bookings/BookingTable';
import BookingInsights from '../components/bookings/BookingInsights';
import RecentActivity from '../components/bookings/RecentActivity';

// Helpers
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const timeAgo = (iso: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [insights, setInsights] = useState<BookingInsight[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [insightsDate, setInsightsDate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const dateParam = insightsDate.toLocaleDateString('en-CA');
      const [bookingsRes, statsRes, insightsRes, activityRes] = await Promise.all([
        api.get(`/bookings/owner/all?status=${filter}&search=${search}&date=${dateParam}`),
        api.get(`/bookings/owner/stats?date=${dateParam}`),
        api.get(`/bookings/owner/insights?date=${dateParam}`),
        api.get('/bookings/owner/recent')
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
      setInsights(insightsRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, search, insightsDate]);

  const doAction = async (bookingId: string, action: 'confirm' | 'owner-cancel') => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/${action}`);
      fetchData();
    } catch (err) {
      alert(getApiError(err, `Failed to ${action} booking.`));
    } finally {
      setActionLoading(null);
    }
  };

  const doConfirmPayment = async (paymentId: string, bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/payments/${paymentId}/confirm`);
      setReceiptBooking(null);
      fetchData();
    } catch (err) {
      alert(getApiError(err, 'Failed to confirm payment.'));
    } finally {
      setActionLoading(null);
    }
  };

  const doRejectPayment = async (paymentId: string, bookingId: string, reason: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/payments/${paymentId}/reject`, { reason });
      setReceiptBooking(null);
      fetchData();
    } catch (err) {
      alert(getApiError(err, 'Failed to reject payment.'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[var(--color-text-muted)] font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const startDate = new Date(insightsDate);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(insightsDate.getDate() - 3);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const dateRangeLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      {/* ─── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-[11px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] mb-1.5">Overview</div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-base)]">Bookings</h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-xl shadow-sm cursor-pointer hover:border-[var(--color-border-strong)] transition-all relative group"
            onClick={() => (document.getElementById('dash-date-picker') as any)?.showPicker()}
          >
            <span className="text-sm font-bold text-[var(--color-text-secondary)]">{dateRangeLabel}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              id="dash-date-picker"
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
              onChange={(e) => e.target.value && setInsightsDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-xl text-[var(--color-danger)] text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}

      {/* ─── Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard label="Pending Approval" value={stats?.pending || 0} sub="Requires action" color="warning" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label="Confirmed" value={stats?.confirmed || 0} sub="Scheduled slots" color="success" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} />
        <StatCard label="Paid" value={stats?.paid || 0} sub="Completed payments" color="info" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>} />
        <StatCard label="Total Revenue" value={`${stats?.revenue.toLocaleString() || 0} ETB`} sub="All time earnings" color="success" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
      </div>

      <BookingTable
        bookings={bookings} loading={loading} filter={filter} setFilter={setFilter}
        search={search} setSearch={setSearch} fmtDate={fmtDate} fmtTime={fmtTime}
        doAction={doAction} actionLoading={actionLoading} setReceiptBooking={setReceiptBooking}
      />

      <div className="grid grid-cols-[1fr_400px] gap-8">
        <BookingInsights insights={insights} stats={stats} />
        <RecentActivity activities={activities} fmtDate={fmtDate} timeAgo={timeAgo} />
      </div>

      {receiptBooking && (
        <ReceiptModal
          booking={receiptBooking}
          busy={actionLoading === receiptBooking.id}
          onConfirm={() => doConfirmPayment(receiptBooking!.payment!.id, receiptBooking!.id)}
          onReject={(reason) => doRejectPayment(receiptBooking!.payment!.id, receiptBooking!.id, reason)}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
}
