import { Booking } from '../../types';
import { StatusBadge, PaymentBadge } from './Badges';

interface Props {
  bookings: Booking[];
  loading: boolean;
  filter: string;
  setFilter: (f: any) => void;
  search: string;
  setSearch: (s: string) => void;
  fmtDate: (iso: string) => string;
  fmtTime: (iso: string) => string;
  doAction: (id: string, action: any) => void;
  actionLoading: string | null;
  setReceiptBooking: (b: Booking) => void;
}

export default function BookingTable({ 
  bookings, loading, filter, setFilter, search, setSearch, 
  fmtDate, fmtTime, doAction, actionLoading, setReceiptBooking
}: Props) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[20px] shadow-sm overflow-hidden mb-8">
      {/* Table Header / Filters */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--color-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white">
        <div className="flex flex-nowrap items-center gap-1 p-1 bg-[var(--color-surface-muted)] rounded-xl overflow-x-auto w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-black transition-all uppercase tracking-wider ${
                filter === f 
                  ? 'bg-white text-[var(--color-primary)] shadow-sm' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input 
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-muted)] border-none rounded-xl text-xs font-bold text-[var(--color-text-base)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--color-surface-muted)]/50">
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Player</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Date & Time</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Payment</th>
              <th className="px-6 py-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          {bookings.length > 0 && (
            <tbody className="divide-y divide-[var(--color-border)]">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[var(--color-surface-muted)]/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center font-black text-xs">
                        {booking.player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-[var(--color-text-base)]">{booking.player.name}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{booking.player.email}</div>
                        {booking.bookingCode && (
                          <div className="text-[10px] font-black text-[var(--color-primary)] tracking-wider mt-1">
                            {booking.bookingCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-[var(--color-text-secondary)]">{fmtDate(booking.slot.startTime)}</div>
                    <div className="text-[11px] font-black text-[var(--color-primary)]">{fmtTime(booking.slot.startTime)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-danger)]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span className="text-sm font-bold text-[var(--color-text-secondary)]">{booking.slot.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-[var(--color-text-base)]">{booking.slot.price.toLocaleString()}</div>
                    <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">ETB</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge status={booking.payment?.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'PENDING' && booking.payment?.status === 'RECEIPT_SUBMITTED' ? (
                        <button 
                          onClick={() => setReceiptBooking(booking)}
                          className="px-3 py-1.5 bg-[var(--color-info-bg)] text-[var(--color-info)] text-[11px] font-black rounded-lg border border-[var(--color-info)]/20 hover:bg-[var(--color-info)] hover:text-white transition-all"
                        >
                          Review Receipt
                        </button>
                      ) : booking.status === 'CONFIRMED' ? (
                        <button 
                          onClick={() => booking.payment ? setReceiptBooking(booking) : null}
                          className="px-3 py-1.5 bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[11px] font-black rounded-lg hover:bg-[var(--color-surface-muted)] transition-all"
                        >
                          {booking.payment?.status === 'RECEIPT_SUBMITTED' ? 'Review Receipt' : 'View Details'}
                        </button>
                      ) : booking.status === 'PENDING' ? (
                        <span className="text-[11px] font-bold text-[var(--color-text-muted)]">Awaiting receipt</span>
                      ) : null}
                      {booking.status !== 'PENDING' && (
                        <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      
      {loading && (
        <div className="py-20 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)]">Updating bookings...</div>
      )}
      {!loading && bookings.length === 0 && (
        <div className="py-20 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)]">No bookings found matching your criteria.</div>
      )}
    </div>
  );
}
