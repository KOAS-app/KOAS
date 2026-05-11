import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Booking } from '../types';
import { getApiError } from '../utils/apiError';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusStyle: Record<string, string> = {
  PENDING:   'badge-warning',
  CONFIRMED: 'badge-success',
  CANCELLED: 'badge-danger',
};

export default function BookingsPage() {
  const { id: stadiumId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/bookings/stadium/${stadiumId}`);
      setBookings(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load bookings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [stadiumId]);

  const handleAction = async (bookingId: string, action: 'confirm' | 'owner-cancel') => {
    setActionLoading(bookingId);
    try {
      const res = await api.patch(`/bookings/${bookingId}/${action}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: res.data.status } : b))
      );
    } catch (err) {
      alert(getApiError(err, 'Action failed.'));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  // Summary counts
  const counts = bookings.reduce<Record<string, number>>(
    (acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc; },
    {}
  );

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/stadiums')} className="btn btn-ghost text-sm">
          ← Back
        </button>
        <h1 className="page-title mb-0">Bookings</h1>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded mb-4"
          style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['PENDING', 'CONFIRMED', 'CANCELLED'] as Filter[]).map((s) => (
            <div key={s} className="card text-center py-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {counts[s] ?? 0}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit"
        style={{ backgroundColor: 'var(--color-surface-muted)' }}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
              color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: filter === f ? 'var(--shadow-card)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading bookings...</p>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-medium" style={{ color: 'var(--color-text-base)' }}>
            No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings
          </p>
        </div>
      )}

      {/* Bookings list */}
      {!loading && filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {filtered.map((booking, i) => (
            <div
              key={booking.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-base)' }}>
                  {booking.player.name}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {booking.player.email}
                </p>
              </div>

              {/* Slot time */}
              <div className="text-sm text-center" style={{ color: 'var(--color-text-muted)', minWidth: 160 }}>
                <p>{fmt(booking.slot.startTime)}</p>
                <p className="text-xs">→ {new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Price */}
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)', minWidth: 80, textAlign: 'right' }}>
                {booking.slot.price.toLocaleString()} ETB
              </p>

              {/* Status badge */}
              <span className={`badge ${statusStyle[booking.status]}`}>
                {booking.status}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-accent text-xs"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleAction(booking.id, 'confirm')}
                    >
                      ✓ Confirm
                    </button>
                    <button
                      className="btn btn-danger text-xs"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleAction(booking.id, 'owner-cancel')}
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <button
                    className="btn btn-ghost text-xs"
                    disabled={actionLoading === booking.id}
                    onClick={() => handleAction(booking.id, 'owner-cancel')}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
