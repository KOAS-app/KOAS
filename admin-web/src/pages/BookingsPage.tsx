import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Booking } from '../types';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

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
      <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-6">Bookings</h1>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3.5 mb-7">
          {(['PENDING', 'CONFIRMED', 'CANCELLED'] as Filter[]).map((s) => {
            const colors = {
              PENDING: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
              CONFIRMED: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
              CANCELLED: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
            };
            const color = colors[s];
            return (
              <div key={s} className="rounded-[10px] p-[1rem_1.125rem] border" style={{ background: color.bg, borderColor: color.border }}>
                <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] mb-1.5 opacity-80" style={{ color: color.text }}>
                  {s}
                </p>
                <p className="text-[1.5rem] font-black tracking-tight leading-none" style={{ color: color.text }}>
                  {counts[s] ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)] w-fit">
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-lg font-bold transition-all ${
              filter === f 
                ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm' 
                : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3.5 py-20">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading bookings…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">📋</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No bookings found</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {filter === 'ALL' ? 'No bookings have been made yet.' : `No ${filter.toLowerCase()} bookings at the moment.`}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid px-5 py-3 text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]"
            style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
            <span>Player</span>
            <span>Stadium</span>
            <span>Slot</span>
            <span>Status</span>
          </div>

          {filtered.map((booking, i) => (
            <div key={booking.id}
              className="grid items-center px-5 py-3.5 gap-4 transition-all hover:bg-[var(--color-surface-muted)]"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr auto',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
              <div>
                <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight">
                  {booking.player.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                  {booking.player.email}
                </p>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] font-medium">
                {booking.stadium.name}
              </p>
              <div>
                <p className="text-sm text-[var(--color-text-base)] font-medium">
                  {fmt(booking.slot.startTime)}
                </p>
                <p className="text-xs font-bold text-[var(--color-primary)] mt-0.5">
                  {booking.slot.price.toLocaleString()} ETB
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${
                booking.status === 'CONFIRMED' 
                  ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]' 
                  : booking.status === 'PENDING'
                    ? 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]'
                    : 'bg-[var(--color-danger-bg)] text-[#b91c1c] border-[#fecaca]'
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
