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
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-black tracking-tight text-[var(--color-text-base)] leading-tight">
            Disputed Transfers
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Review and resolve bank transfer receipt disputes flagged by turf owners.
          </p>
        </div>
        {!loading && disputes.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-50 border border-purple-200/50 text-purple-700 text-xs font-extrabold w-fit shadow-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {disputes.length} open dispute{disputes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3.5 py-40">
          <div className="inline-block w-8 h-8 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading disputes…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && disputes.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-16 shadow-sm text-center">
          <div className="text-5xl opacity-40 mb-4">🛡️</div>
          <p className="text-base font-bold text-[var(--color-text-base)]">All Resolved</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Every payment dispute has been arbitrated successfully.</p>
        </div>
      )}

      {/* Dispute cards */}
      {!loading && disputes.length > 0 && (
        <div className="flex flex-col gap-5">
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
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Premium glowing top stripe */}
      <div className="h-[3px] bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500" />

      <div className="p-6 flex flex-col gap-5">
        {/* Top row: stadium + slot + disputed badge */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-base font-extrabold text-[var(--color-text-base)] tracking-tight">
              {booking.stadium.name}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1">
              <span>📍 {booking.slot.location}</span>
              <span className="opacity-40">·</span>
              <span>{new Date(booking.slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="opacity-40">·</span>
              <span>{fmtTime(booking.slot.startTime)} – {fmtTime(booking.slot.endTime)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border bg-purple-50 text-purple-700 border-purple-200/50">
              ⚠ DISPUTED
            </span>
            <span className="text-lg font-black text-[var(--color-primary)]">
              {dispute.amount.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Two-column: player vs owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Player side */}
          <div className="rounded-2xl bg-[var(--color-info-bg)] border border-[var(--color-info)]/15 p-4.5 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-info)] mb-2.5 flex items-center gap-1.5">
                👤 Player (Claimant)
              </p>
              <p className="text-sm font-extrabold text-[var(--color-text-base)]">{booking.player.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium truncate">{booking.player.email}</p>
              {booking.player.phoneNumber && (
                <a
                  href={`tel:${booking.player.phoneNumber}`}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline mt-1.5 inline-flex items-center gap-1"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {booking.player.phoneNumber}
                </a>
              )}
            </div>
            
            {dispute.disputeReason && (
              <div className="mt-3.5 pt-3.5 border-t border-[var(--color-info)]/15">
                <p className="text-[9px] font-black uppercase text-[var(--color-info)] mb-1">Player's Claim:</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic bg-white/60 p-2.5 rounded-lg border border-[var(--color-info)]/5">
                  "{dispute.disputeReason}"
                </p>
              </div>
            )}
            <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
              Flagged: {fmtDate(dispute.disputedAt)}
            </p>
          </div>

          {/* Owner side */}
          <div className="rounded-2xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/15 p-4.5 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-danger)] mb-2.5 flex items-center gap-1.5">
                🏟️ Owner (Respondent)
              </p>
              <p className="text-sm font-extrabold text-[var(--color-text-base)]">{booking.stadium.owner.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium truncate">{booking.stadium.owner.email}</p>
            </div>

            {dispute.ownerRejectionReason && (
              <div className="mt-3.5 pt-3.5 border-t border-[var(--color-danger)]/15">
                <p className="text-[9px] font-black uppercase text-[var(--color-danger)] mb-1">Owner's Rejection Reason:</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic bg-white/60 p-2.5 rounded-lg border border-[var(--color-danger)]/5">
                  "{dispute.ownerRejectionReason}"
                </p>
              </div>
            )}
            <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
              Rejected: {fmtDate(dispute.ownerRejectedAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-4 border-t border-[var(--color-border)]">
          {dispute.receiptImageUrl && (
            <button
              onClick={onViewReceipt}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold text-[#7e22ce] bg-[#fdf4ff] border border-[#e9d5ff] transition-all hover:bg-[#f5e3ff]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              Inspect Receipt Image
            </button>
          )}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={onResolveForPlayer}
              disabled={busy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {busy ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓ Rule for Player (Mark Paid)'}
            </button>
            <button
              onClick={onResolveForOwner}
              disabled={busy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-200"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-sm font-black text-[var(--color-text-base)]">Review Receipt Evidence</h2>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Player {dispute.booking.player.name} &nbsp;·&nbsp; {dispute.booking.stadium.name}
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
        <div className="p-5 overflow-y-auto flex-1 bg-[var(--color-surface-muted)]/50">
          <img
            src={`${API_URL}${dispute.receiptImageUrl}`}
            alt="Payment receipt"
            className="w-full object-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-xs"
          />
        </div>

        {/* Dispute summary */}
        <div className="px-6 py-4.5 flex flex-col gap-2.5 text-xs border-t border-[var(--color-border)] bg-[var(--color-surface-card)]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[var(--color-text-muted)] w-28">Amount:</span>
            <span className="font-black text-[var(--color-primary)]">{dispute.amount.toLocaleString()} ETB</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-extrabold text-[var(--color-text-muted)] w-28">Player Claims:</span>
            <span className="text-[var(--color-text-secondary)] italic bg-[var(--color-info-bg)] px-2 py-1 rounded border border-[var(--color-info)]/10 font-medium flex-1">
              "{dispute.disputeReason}"
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-extrabold text-[var(--color-text-muted)] w-28">Owner Claims:</span>
            <span className="text-[var(--color-text-secondary)] italic bg-[var(--color-danger-bg)] px-2 py-1 rounded border border-[var(--color-danger)]/10 font-medium flex-1">
              "{dispute.ownerRejectionReason}"
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 px-6 pb-6 pt-3 flex-shrink-0 bg-[var(--color-surface-card)]">
          <button
            onClick={onResolveForPlayer}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {busy
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : '✓ Rule for Player — Mark Paid'
            }
          </button>
          <button
            onClick={onResolveForOwner}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[var(--color-danger)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✗ Rule for Owner — Keep Rejected
          </button>
        </div>
      </div>
    </div>
  );
}
