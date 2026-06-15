import type { Booking } from '../../types';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]',
  CONFIRMED: 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]',
  CANCELLED: 'bg-[var(--color-danger-bg)] text-[#b91c1c] border-[#fecaca]',
};

export const PAYMENT_BADGE: Record<string, string> = {
  PENDING:           'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]',
  RECEIPT_SUBMITTED: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
  PAID:              'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]',
  REJECTED:          'bg-[var(--color-danger-bg)] text-[#b91c1c] border-[#fecaca]',
};

export const PAYMENT_LABEL: Record<string, string> = {
  PENDING:           '⏳ Awaiting Payment',
  RECEIPT_SUBMITTED: '📎 Receipt Submitted',
  PAID:              '✓ Paid',
  REJECTED:          '✗ Rejected',
};

interface Props {
  booking: Booking;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onViewReceipt: () => void;
}

export default function BookingRow({ booking, busy, onConfirm, onCancel, onViewReceipt }: Props) {
  const initials = booking.player.name.slice(0, 2).toUpperCase();
  const statusColor =
    booking.status === 'CONFIRMED' ? 'var(--color-success)'
    : booking.status === 'PENDING' ? 'var(--color-warning)'
    : 'var(--color-danger)';

  const hasReceipt = booking.payment?.status === 'RECEIPT_SUBMITTED' && booking.payment?.receiptImageUrl;

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] p-[1.125rem_1.375rem] shadow-sm flex items-center gap-4 flex-wrap transition-all hover:border-[var(--color-border-strong)] hover:shadow-md">

      {/* Status bar + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: statusColor }} />
        <div className="w-11 h-11 rounded-[10px] flex-shrink-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-[0.9375rem] font-black text-white shadow-sm">
          {initials}
        </div>
      </div>

      {/* Player info */}
      <div className="flex-[1_1_200px] min-w-0">
        <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight truncate">
          {booking.player.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-[0.8125rem] text-[var(--color-text-muted)] truncate">
            {booking.player.email}
          </p>
          {booking.player.phoneNumber && (
            <>
              <span className="text-[var(--color-text-muted)]">•</span>
              <a
                href={`tel:${booking.player.phoneNumber}`}
                className="text-[0.8125rem] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {booking.player.phoneNumber}
              </a>
            </>
          )}
        </div>
      </div>

      {/* Slot time */}
      <div className="flex-[0_0_auto] text-center px-4 py-2 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
        <p className="text-[0.6875rem] font-extrabold text-[var(--color-text-muted)] uppercase tracking-[0.04em]">
          {fmtDate(booking.slot.startTime)}
        </p>
        <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight mt-1">
          {fmtTime(booking.slot.startTime)} – {fmtTime(booking.slot.endTime)}
        </p>
        <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-0.5">
          📍 {booking.slot.location}
        </p>
      </div>

      {/* Price */}
      <div className="flex-[0_0_auto] text-right">
        <p className="text-[1.125rem] font-black text-[var(--color-primary)] tracking-tight leading-none">
          {booking.slot.price.toLocaleString()}
        </p>
        <p className="text-[0.6875rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wide mt-1">ETB</p>
      </div>

      {/* Status badges */}
      <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${STATUS_BADGE[booking.status] ?? ''}`}>
          {booking.status}
        </span>
        {booking.payment && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${PAYMENT_BADGE[booking.payment.status] ?? ''}`}>
            {PAYMENT_LABEL[booking.payment.status] ?? booking.payment.status}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 ml-auto flex-wrap">
        {booking.status === 'PENDING' && hasReceipt && (
          <>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] transition-all hover:bg-[#dbeafe] disabled:opacity-50"
              disabled={busy} onClick={onViewReceipt}
            >
              📎 Review Receipt
            </button>
          </>
        )}

        {booking.status === 'PENDING' && !hasReceipt && (
          <span className="text-[0.8125rem] font-bold text-[var(--color-text-muted)]">Awaiting receipt</span>
        )}

        {booking.status === 'CONFIRMED' && (
          <>
            {hasReceipt && (
              <button
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] transition-all hover:bg-[#dbeafe] disabled:opacity-50"
                disabled={busy} onClick={onViewReceipt}
              >
                📎 Review Receipt
              </button>
            )}
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-muted)] bg-transparent border border-[var(--color-border)] transition-all hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-50"
              disabled={busy} onClick={onCancel}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
