import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Booking } from '../types';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/15';
    case 'PENDING':
      return 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/15';
    case 'CANCELLED':
    default:
      return 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/15';
  }
};

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
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-[1.625rem] font-black tracking-tight text-[var(--color-text-base)] leading-tight">
          Bookings Management
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Monitor player bookings, slot schedules, and confirmation statuses across KOAS.
        </p>
      </div>

      {/* Summary Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {(['PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((s) => {
            const styles = {
              PENDING: 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]/20 text-[var(--color-warning)]',
              CONFIRMED: 'bg-[var(--color-success-bg)] border-[var(--color-success)]/20 text-[var(--color-success)]',
              CANCELLED: 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/20 text-[var(--color-danger)]',
            };
            const styleClass = styles[s];
            return (
              <div key={s} className={`rounded-2xl p-5.5 border shadow-xs transition-all hover:shadow-md ${styleClass}`}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1.5 opacity-90">
                  {s}
                </p>
                <p className="text-3xl font-black tracking-tight leading-none">
                  {counts[s] ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls & Filter tabs */}
      <div className="flex flex-nowrap items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] overflow-x-auto w-full sm:w-fit [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`whitespace-nowrap flex-shrink-0 text-xs px-4 py-2.5 rounded-lg font-extrabold transition-all duration-150 ${
              filter === f 
                ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm' 
                : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3.5 py-40">
          <div className="inline-block w-8 h-8 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading bookings…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-16 shadow-sm text-center">
          <div className="text-5xl opacity-40 mb-4">📋</div>
          <p className="text-base font-bold text-[var(--color-text-base)]">No bookings found</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {filter === 'ALL' ? 'No bookings have been made yet.' : `No ${filter.toLowerCase()} bookings at the moment.`}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1.5fr_110px] gap-4 px-6 py-3.5 text-[10px] font-black uppercase tracking-wider bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            <span>Player</span>
            <span>Stadium</span>
            <span>Slot</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((booking) => (
              <div key={booking.id}
                className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1fr_1.5fr_110px] items-stretch sm:items-center px-6 py-4.5 sm:py-4 gap-3.5 sm:gap-4 transition-all hover:bg-[var(--color-surface-muted)]/50">
                
                {/* Player Info & Mobile Status */}
                <div className="flex items-start justify-between gap-3 sm:block min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[var(--color-text-base)] tracking-tight truncate">
                      {booking.player.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-medium truncate">
                      {booking.player.email}
                    </p>
                  </div>
                  <span className={`sm:hidden inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide border flex-shrink-0 ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Stadium */}
                <div className="min-w-0">
                  <span className="sm:hidden text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block mb-0.5">Stadium</span>
                  <p className="text-xs text-[var(--color-text-secondary)] font-extrabold truncate">
                    {booking.stadium.name}
                  </p>
                </div>

                {/* Slot */}
                <div>
                  <span className="sm:hidden text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block mb-0.5">Slot</span>
                  <p className="text-xs text-[var(--color-text-base)] font-bold">
                    {fmt(booking.slot.startTime)}
                  </p>
                  <p className="text-[11px] font-black text-[var(--color-primary)] mt-0.5">
                    {booking.slot.price.toLocaleString()} ETB
                  </p>
                </div>

                {/* Status (Desktop only) */}
                <div>
                  <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide border flex-shrink-0 ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
