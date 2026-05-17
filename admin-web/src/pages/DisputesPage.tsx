import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Dispute } from '../types';
import { getApiError } from '../utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function DisputesPage() {
  const [disputes, setDisputes]         = useState<Dispute[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<Dispute | null>(null);

  useEffect(() => {
    api.get('/admin/disputes')
      .then(r => setDisputes(r.data))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (paymentId: string, side: 'player' | 'owner') => {
    setActionLoading(paymentId);
    try {
      await api.patch(`/admin/disputes/${paymentId}/resolve-for-${side}`, {
        resolution: side === 'player'
          ? 'Admin confirmed payment is valid. Marked as PAID.'
          : 'Admin sided with owner. Receipt rejected.',
      });
      setDisputes(prev => prev.filter(d => d.id !== paymentId));
      setReceiptModal(null);
    } catch (err) {
      alert(getApiError(err, 'Failed to resolve dispute.'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">
            Disputes
          </h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Review and resolve payment disputes between players and owners.
          </p>
        </div>
        {!loading && disputes.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#fdf4ff] border border-[#e9d5ff] text-[#7e22ce] text-sm font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {disputes.length} open dispute{disputes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-20">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm">Loading disputes…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && disputes.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-16 shadow-sm text-center">
          <div className="text-5xl opacity-40 mb-4">✅</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No open disputes</p>
          <p className="text-sm text-[var(--color-text-muted)]">All payment disputes have been resolved.</p>
        </div>
      )}

      {/* Dispute cards */}
      {!loading && disputes.length > 0 && (
        <div className="flex flex-col gap-4">
          {disputes.map(dispute => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              busy={actionLoading === dispute.id}
              onViewReceipt={() => setReceiptModal(dispute)}
              onResolveForPlayer={() => resolve(dispute.id, 'player')}
              onResolveForOwner={() => resolve(dispute.id, 'owner')}
            />
          ))}
        </div>
      )}

      {/* Receipt viewer modal */}
      {receiptModal && (
        <ReceiptReviewModal
          dispute={receiptModal}
          busy={actionLoading === receiptModal.id}
          onResolveForPlayer={() => resolve(receiptModal.id, 'player')}
          onResolveForOwner={() => resolve(receiptModal.id, 'owner')}
          onClose={() => setReceiptModal(null)}
        />
      )}
    </div>
  );
}

/* ─── Dispute Card ─────────────────────────────────────────────────────────── */
interface CardProps {
  dispute: Dispute;
  busy: boolean;
  onViewReceipt: () => void;
  onResolveForPlayer: () => void;
  onResolveForOwner: () => void;
}

function DisputeCard({ dispute, busy, onViewReceipt, onResolveForPlayer, onResolveForOwner }: CardProps) {
  const { booking } = dispute;

  return (
    <div className="bg-[var(--color-surface-card)] border border-[#e9d5ff] rounded-[14px] shadow-sm overflow-hidden">
      {/* Purple top bar */}
      <div className="h-1 bg-gradient-to-r from-[#7e22ce] to-[#a855f7]" />

      <div className="p-5 flex flex-col gap-4">
        {/* Top row: stadium + slot + disputed badge */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-base font-extrabold text-[var(--color-text-base)] tracking-tight">
              {booking.stadium.name}
            </p>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              📍 {booking.slot.location} &nbsp;·&nbsp;
              {new Date(booking.slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              &nbsp; {fmtTime(booking.slot.startTime)} – {fmtTime(booking.slot.endTime)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border bg-[#fdf4ff] text-[#7e22ce] border-[#e9d5ff]">
              ⚠ DISPUTED
            </span>
            <span className="text-[1rem] font-black text-[var(--color-primary)]">
              {dispute.amount.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Two-column: player vs owner */}
        <div className="grid grid-cols-2 gap-3">
          {/* Player side */}
          <div className="rounded-[10px] bg-[#eff6ff] border border-[#bfdbfe] p-3.5">
            <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] text-[#1d4ed8] mb-2">
              Player (Claimant)
            </p>
            <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)]">{booking.player.name}</p>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">{booking.player.email}</p>
            {booking.player.phoneNumber && (
              <a
                href={`tel:${booking.player.phoneNumber}`}
                className="text-[0.8125rem] font-semibold text-[#1d4ed8] hover:underline mt-0.5 flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {booking.player.phoneNumber}
              </a>
            )}
            {dispute.disputeReason && (
              <div className="mt-2.5 pt-2.5 border-t border-[#bfdbfe]">
                <p className="text-[0.6875rem] font-bold text-[#1d4ed8] mb-1">Player's Claim:</p>
                <p className="text-[0.8125rem] text-[var(--color-text-secondary)] leading-relaxed">
                  "{dispute.disputeReason}"
                </p>
              </div>
            )}
            <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-2">
              Disputed: {fmtDate(dispute.disputedAt)}
            </p>
          </div>

          {/* Owner side */}
          <div className="rounded-[10px] bg-[var(--color-danger-bg)] border border-[#fecaca] p-3.5">
            <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.06em] text-[#b91c1c] mb-2">
              Owner (Respondent)
            </p>
            <p className="text-[0.9375rem] font-bold text-[var(--color-text-base)]">{booking.stadium.owner.name}</p>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">{booking.stadium.owner.email}</p>
            {dispute.ownerRejectionReason && (
              <div className="mt-2.5 pt-2.5 border-t border-[#fecaca]">
                <p className="text-[0.6875rem] font-bold text-[#b91c1c] mb-1">Owner's Rejection Reason:</p>
                <p className="text-[0.8125rem] text-[var(--color-text-secondary)] leading-relaxed">
                  "{dispute.ownerRejectionReason}"
                </p>
              </div>
            )}
            <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-2">
              Rejected: {fmtDate(dispute.ownerRejectedAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 border-t border-[var(--color-border)]">
          {dispute.receiptImageUrl && (
            <button
              onClick={onViewReceipt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] transition-all hover:bg-[#dbeafe]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              View Receipt
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onResolveForPlayer}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <div className="w-3 h-3 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" /> : '✓ Rule for Player (Mark Paid)'}
            </button>
            <button
              onClick={onResolveForOwner}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✗ Rule for Owner (Keep Rejected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Receipt Review Modal ─────────────────────────────────────────────────── */
interface ModalProps {
  dispute: Dispute;
  busy: boolean;
  onResolveForPlayer: () => void;
  onResolveForOwner: () => void;
  onClose: () => void;
}

function ReceiptReviewModal({ dispute, busy, onResolveForPlayer, onResolveForOwner, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)]">Receipt Evidence</h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {dispute.booking.player.name} → {dispute.booking.stadium.name}
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
        <div className="p-4 overflow-y-auto flex-1">
          <img
            src={`${API_URL}${dispute.receiptImageUrl}`}
            alt="Payment receipt"
            className="w-full object-contain rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          />
        </div>

        {/* Dispute summary */}
        <div className="px-5 pb-3 flex flex-col gap-1.5 text-[0.8125rem]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text-muted)] w-28">Amount:</span>
            <span className="font-black text-[var(--color-primary)]">{dispute.amount.toLocaleString()} ETB</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[var(--color-text-muted)] w-28">Player says:</span>
            <span className="text-[var(--color-text-secondary)] italic">"{dispute.disputeReason}"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[var(--color-text-muted)] w-28">Owner says:</span>
            <span className="text-[var(--color-text-secondary)] italic">"{dispute.ownerRejectionReason}"</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 px-5 pb-5 flex-shrink-0">
          <button
            onClick={onResolveForPlayer}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : '✓ Rule for Player — Mark Paid'
            }
          </button>
          <button
            onClick={onResolveForOwner}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-bold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✗ Rule for Owner — Keep Rejected
          </button>
        </div>
      </div>
    </div>
  );
}
