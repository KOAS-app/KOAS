import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Booking } from '../types';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const statusStyle: Record<string, string> = {
  PENDING:   'badge-warning',
  CONFIRMED: 'badge-success',
  CANCELLED: 'badge-danger',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    api.get('/admin/bookings')
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const counts = bookings.reduce<Record<string, number>>(
    (acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc; }, {}
  );

  return (
    <div>
      <h1 className="page-title">Bookings</h1>

      {/* Summary */}
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
          <button key={f} onClick={() => setFilter(f)}
            className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
              color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: filter === f ? 'var(--shadow-card)' : 'none',
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">📋</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No bookings found</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {/* Header */}
          <div className="grid px-5 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr auto',
              color: 'var(--color-text-muted)',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-muted)',
            }}>
            <span>Player</span>
            <span>Stadium</span>
            <span>Slot</span>
            <span>Status</span>
          </div>

          {filtered.map((booking, i) => (
            <div key={booking.id}
              className="grid items-center px-5 py-3 gap-4"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr auto',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-base)' }}>
                  {booking.player.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {booking.player.email}
                </p>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {booking.stadium.name}
              </p>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-base)' }}>
                  {fmt(booking.slot.startTime)}
                </p>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {booking.slot.price.toLocaleString()} ETB
                </p>
              </div>
              <span className={`badge ${statusStyle[booking.status]}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
