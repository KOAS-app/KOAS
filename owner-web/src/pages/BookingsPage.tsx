import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Booking } from '../types';
import { getApiError } from '../utils/apiError';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]',
  CONFIRMED: 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]',
  CANCELLED: 'bg-[var(--color-danger-bg)] text-[#b91c1c] border-[#fecaca]',
};
const PAYMENT_BADGE: Record<string, string> = {
  PENDING: 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]',
  PAID:    'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]',
  FAILED:  'bg-[var(--color-danger-bg)] text-[#b91c1c] border-[#fecaca]',
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL',       label: 'All' },
  { key: 'PENDING',   label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function BookingsPage() {
  const navigate = useNavigate();

  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState<Filter>('ALL');

  const fetchBookings = async () => {
    try {
      // First get the stadium
      const stadiumRes = await api.get('/stadiums/my');
      const stadium = stadiumRes.data[0];
      
      if (!stadium) {
        setError('No stadium found. Please create a stadium first.');
        setLoading(false);
        return;
      }

      setStadiumId(stadium.id);

      // Then fetch bookings
      const res = await api.get(`/bookings/stadium/${stadium.id}`);
      setBookings(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load bookings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const doAction = async (bookingId: string, action: 'confirm' | 'owner-cancel') => {
    setActionLoading(bookingId);
    try {
      const res = await api.patch(`/bookings/${bookingId}/${action}`);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: res.data.status } : b));
    } catch (err) { alert(getApiError(err, 'Action failed.')); }
    finally { setActionLoading(null); }
  };

  const doMarkPaid = async (paymentId: string, bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await api.patch(`/payments/${paymentId}/mark-paid`);
      setBookings(prev => prev.map(b =>
        b.id === bookingId && b.payment ? { ...b, payment: { ...b.payment, status: res.data.status } } : b
      ));
    } catch (err) { alert(getApiError(err, 'Failed to mark as paid.')); }
    finally { setActionLoading(null); }
  };

  const filtered  = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
  const counts    = bookings.reduce<Record<string, number>>((a, b) => { a[b.status] = (a[b.status] ?? 0) + 1; return a; }, {});
  const revenue   = bookings.reduce((s, b) => b.payment?.status === 'PAID' ? s + b.payment.amount : s, 0);
  const pending   = counts['PENDING'] ?? 0;
  const confirmed = counts['CONFIRMED'] ?? 0;
  const cancelled = counts['CANCELLED'] ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">Bookings</h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Review and manage all reservations for your stadium.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats Bar */}
      {!loading && (
        <div className="grid grid-cols-4 gap-3.5 mb-7">
          <StatCard label="Pending"   value={pending}   accent="#d97706" bg="#fffbeb" border="#fde68a" />
          <StatCard label="Confirmed" value={confirmed} accent="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
          <StatCard label="Cancelled" value={cancelled} accent="#dc2626" bg="#fef2f2" border="#fecaca" />
          <StatCard
            label="Revenue"
            value={`${revenue.toLocaleString()}`}
            accent="#2563eb"
            bg="#eff6ff"
            border="#bfdbfe"
            suffix="ETB"
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)] w-fit mb-6">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg cursor-pointer border-none text-[0.8125rem] font-bold transition-all ${
              filter === key
                ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm'
                : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {label}
            {key !== 'ALL' && counts[key] !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-md text-[0.6875rem] font-extrabold ${
                filter === key
                  ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm">Loading bookings…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">📋</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            {filter === 'ALL'
              ? 'No reservations have been made for this stadium yet.'
              : `There are no ${filter.toLowerCase()} reservations right now.`}
          </p>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {filtered.map(booking => (
            <BookingRow
              key={booking.id}
              booking={booking}
              busy={actionLoading === booking.id}
              onConfirm={() => doAction(booking.id, 'confirm')}
              onCancel={() => doAction(booking.id, 'owner-cancel')}
              onMarkPaid={() => doMarkPaid(booking.payment!.id, booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* Stat Card */
function StatCard({ label, value, accent, bg, border, suffix }: { label: string; value: string | number; accent: string; bg: string; border: string; suffix?: string; }) {
  return (
    <div className="rounded-[10px] p-[1rem_1.125rem] border" style={{ background: bg, borderColor: border }}>
      <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] mb-1.5 opacity-80" style={{ color: accent }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[1.5rem] font-black tracking-tight leading-none" style={{ color: accent }}>
          {value}
        </p>
        {suffix && (
          <span className="text-[0.75rem] font-bold opacity-70" style={{ color: accent }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* Booking Row */
interface RowProps {
  booking: Booking;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onMarkPaid: () => void;
}

function BookingRow({ booking, busy, onConfirm, onCancel, onMarkPaid }: RowProps) {
  const initials = booking.player.name.slice(0, 2).toUpperCase();
  const statusColor = booking.status === 'CONFIRMED' ? 'var(--color-success)' : booking.status === 'PENDING' ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-[1.125rem_1.375rem] shadow-sm flex items-center gap-4 flex-wrap transition-all hover:border-[var(--color-border-strong)] hover:shadow-md">
      {/* Status indicator + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: statusColor }} />
        <div className="w-11 h-11 rounded-[10px] flex-shrink-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-[0.9375rem] font-black text-white shadow-sm">
          {initials}
        </div>
      </div>

      {/* Player info */}
      <div className="flex-[1_1_160px] min-w-0">
        <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">
          {booking.player.name}
        </p>
        <p className="text-[0.8125rem] text-[var(--color-text-muted)] overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
          {booking.player.email}
        </p>
      </div>

      {/* Slot time */}
      <div className="flex-[0_0_auto] text-center px-4 py-2 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
        <p className="text-[0.6875rem] font-extrabold text-[var(--color-text-muted)] uppercase tracking-[0.04em]">
          {fmtDate(booking.slot.startTime)}
        </p>
        <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight mt-1">
          {fmtTime(booking.slot.startTime)} – {fmtTime(booking.slot.endTime)}
        </p>
      </div>

      {/* Price */}
      <div className="flex-[0_0_auto] text-right">
        <p className="text-[1.125rem] font-black text-[var(--color-primary)] tracking-tight leading-none">
          {booking.slot.price.toLocaleString()}
        </p>
        <p className="text-[0.6875rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wide mt-1">
          ETB
        </p>
      </div>

      {/* Status badges */}
      <div className="flex gap-1.5 flex-shrink-0">
        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${STATUS_BADGE[booking.status] ?? 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
          {booking.status}
        </span>
        {booking.payment && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${PAYMENT_BADGE[booking.payment.status] ?? 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
            {booking.payment.status === 'PAID' ? '✓' : '⏳'} {booking.payment.status}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 ml-auto">
        {booking.status === 'PENDING' && (
          <>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? <div className="inline-block w-3 h-3 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" /> : '✓ Accept'}
            </button>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy}
              onClick={onCancel}
            >
              Decline
            </button>
          </>
        )}
        {booking.status === 'CONFIRMED' && (
          <>
            {booking.payment?.status === 'PENDING' && (
              <button
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-primary)] bg-[var(--color-primary-bg)] border border-[#bbf7d0] transition-all hover:bg-[var(--color-success-bg)] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={busy}
                onClick={onMarkPaid}
              >
                Mark Paid
              </button>
            )}
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-muted)] bg-transparent border border-[var(--color-border)] transition-all hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
