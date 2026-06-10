import { useState } from 'react';
import type { Booking } from '../../types';

interface Props {
  booking: Booking;
  busy: boolean;
  onConfirm: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReceiptModal({ booking, busy, onConfirm, onReject, onClose }: Props) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
    onReject(rejectReason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)]">Payment Receipt</h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              Submitted by {booking.player.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Receipt image */}
        {booking.payment?.receiptImageUrl && (
          <div className="p-4 overflow-y-auto">
            <img
              src={`${API_URL}${booking.payment.receiptImageUrl}`}
              alt="Payment receipt"
              className="w-full max-h-[380px] object-contain rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
            />
          </div>
        )}

        {/* Player details */}
        <div className="px-4 pb-3 flex items-center gap-3 flex-wrap text-sm">
          <span className="font-bold text-[var(--color-text-base)]">{booking.player.name}</span>
          {booking.player.phoneNumber && (
            <a
              href={`tel:${booking.player.phoneNumber}`}
              className="text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {booking.player.phoneNumber}
            </a>
          )}
          <span className="text-[var(--color-text-muted)]">•</span>
          <span className="font-black text-[var(--color-primary)]">{booking.slot.price.toLocaleString()} ETB</span>
          <span className="text-[var(--color-text-muted)]">•</span>
          <span className="text-[var(--color-text-muted)]">📍 {booking.slot.location}</span>
        </div>

        {/* Reject reason input */}
        {showRejectForm && (
          <div className="px-4 pb-3">
            <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Rejection Reason <span className="text-[var(--color-danger)]">*</span>
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-sm outline-none resize-none focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
              placeholder="e.g. Wrong amount transferred, receipt is unclear..."
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
        )}

        {/* Action buttons or Status message */}
        <div className="flex gap-2.5 px-4 pb-4 flex-shrink-0">
          {booking.payment?.status !== 'RECEIPT_SUBMITTED' ? (
            <div className={`flex-1 text-center py-2.5 rounded-[10px] text-sm font-bold border ${
              booking.payment?.status === 'PAID' 
                ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/20' 
                : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/20'
            }`}>
              {booking.payment?.status === 'PAID' ? '✓ Payment Confirmed' : '✗ Payment Rejected'}
            </div>
          ) : !showRejectForm ? (
            <>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '✓ Confirm Payment Received'
                }
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
              >
                ✗ Reject Receipt
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReject}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold text-white bg-[var(--color-danger)] border border-[var(--color-danger)] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Confirm Rejection'
                }
              </button>
              <button
                onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                className="px-4 py-2.5 rounded-[10px] text-sm font-bold text-[var(--color-text-muted)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)]"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
