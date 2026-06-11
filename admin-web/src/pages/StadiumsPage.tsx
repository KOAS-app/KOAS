import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [blockModal, setBlockModal] = useState<Stadium | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    api.get('/admin/stadiums')
      .then((r) => setStadiums(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async () => {
    if (!blockModal) return;
    setActionLoading(blockModal.id);
    setBlockModal(null);
    try {
      await api.patch(`/admin/stadiums/${blockModal.id}/block`, { reason: blockReason || undefined });
      setStadiums(prev => prev.map(s => s.id === blockModal.id ? { ...s, isBlocked: true, blockedReason: blockReason } : s));
      setBlockReason('');
    } catch (err) {
      alert(getApiError(err, 'Failed to block stadium.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (stadium: Stadium) => {
    setActionLoading(stadium.id);
    try {
      await api.patch(`/admin/stadiums/${stadium.id}/unblock`);
      setStadiums(prev => prev.map(s => s.id === stadium.id ? { ...s, isBlocked: false, blockedReason: undefined } : s));
    } catch (err) {
      alert(getApiError(err, 'Failed to unblock stadium.'));
    } finally {
      setActionLoading(null);
    }
  };

  const getTierBadge = (plan?: string) => {
    if (!plan) return null;
    const p = plan.toUpperCase();
    if (p === 'ELITE') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
          👑 ELITE
        </span>
      );
    }
    if (p === 'PRO') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
          ⚡ PRO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        🌱 STARTER
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">Stadiums</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          View all registered stadiums and their owners.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3.5 py-20">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading stadiums…</span>
        </div>
      )}

      {!loading && stadiums.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">🏟️</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No stadiums found</p>
          <p className="text-sm text-[var(--color-text-muted)]">No stadiums have been registered yet.</p>
        </div>
      )}

      {!loading && stadiums.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden flex flex-col gap-px bg-[var(--color-border)]">
          {stadiums.map((stadium) => (
            <div key={stadium.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4.5 gap-4 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] transition-all duration-150"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <p className="font-bold text-[0.9375rem] text-[var(--color-text-base)] tracking-tight">
                    {stadium.name}
                  </p>
                  {stadium.isBlocked && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                      BLOCKED
                    </span>
                  )}
                </div>
                <div className="text-xs mt-1.5 text-[var(--color-text-muted)] font-medium flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="flex items-center gap-1">📍 {stadium.locations.length === 1 ? stadium.locations[0].name : `${stadium.locations.length} locations`}</span>
                  <span className="text-[var(--color-border-strong)]">•</span>
                  <span className="flex items-center gap-1">Owner: {stadium.owner.name}</span>
                  {getTierBadge(stadium.owner.subscriptionPlan)}
                  {stadium.owner.phoneNumber && (
                    <>
                      <span className="text-[var(--color-border-strong)]">•</span>
                      <span className="inline-flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {stadium.owner.phoneNumber}
                      </span>
                    </>
                  )}
                </div>
                {stadium.blockedReason && (
                  <p className="text-[11px] text-red-600 font-medium mt-1.5">
                    Reason: {stadium.blockedReason}
                  </p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {stadium.isBlocked ? (
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleUnblock(stadium)}
                  >
                    {actionLoading === stadium.id ? (
                      <div className="inline-block w-3 h-3 border-[1.5px] border-emerald-300 border-t-emerald-700 rounded-full animate-spin" />
                    ) : 'Unblock'}
                  </button>
                ) : (
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-red-600 border border-red-600 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => { setBlockModal(stadium); setBlockReason(''); }}
                  >
                    Block
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {blockModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setBlockModal(null); setBlockReason(''); } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
        >
          <div className="w-full max-w-[420px] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--color-border)]">
              <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
                Block Stadium
              </h2>
              <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
                This will hide {blockModal.name} from players and notify the owner.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Reason for blocking
              </label>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="e.g. Violation of terms of service..."
                rows={3}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] resize-none"
                autoFocus
              />
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => { setBlockModal(null); setBlockReason(''); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-red-600 border border-red-600 hover:bg-red-700 transition-all"
                >
                  Block Stadium
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}