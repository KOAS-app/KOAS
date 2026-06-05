import { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

type Filter = 'ALL' | 'PENDING' | 'APPROVED';

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/stadiums')
      .then((r) => setStadiums(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (stadiumId: string, ownerId: string, action: 'approve' | 'reject') => {
    setActionLoading(stadiumId);
    try {
      await api.patch(`/admin/users/${ownerId}/${action}`);
      setStadiums((prev) =>
        prev.map((s) => (s.id === stadiumId ? { ...s, isApproved: action === 'approve' } : s))
      );
    } catch (err) {
      alert(getApiError(err, 'Action failed.'));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    filter === 'ALL'      ? stadiums :
    filter === 'PENDING'  ? stadiums.filter((s) => !s.isApproved) :
                            stadiums.filter((s) => s.isApproved);

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
          Verify turf ownership requests, manage branches, and view affiliated membership packages.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-6 p-1 rounded-[10px] bg-[var(--color-surface-muted)] border border-[var(--color-border)] w-fit">
        {(['ALL', 'PENDING', 'APPROVED'] as Filter[]).map((f) => (
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
          <span className="text-[var(--color-text-muted)] text-sm font-medium">Loading stadiums…</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
          <div className="text-5xl opacity-50 mb-4">🏟️</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No stadiums found</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {filter === 'PENDING' ? 'No pending stadiums at the moment.' : 'No stadiums match your filter.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden flex flex-col gap-px bg-[var(--color-border)]">
          {filtered.map((stadium) => (
            <div key={stadium.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4.5 gap-4 bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] transition-all duration-150"
            >
              {/* Info & Status */}
              <div className="flex-1 min-w-0 flex items-start justify-between sm:justify-start sm:items-center gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[0.9375rem] text-[var(--color-text-base)] tracking-tight">
                    {stadium.name}
                  </p>
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
                </div>
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border flex-shrink-0 ${
                  stadium.isApproved 
                    ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]' 
                    : 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]'
                }`}>
                  {stadium.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full sm:w-auto">
                {!stadium.isApproved ? (
                  <button 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(59,130,246,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(59,130,246,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, stadium.owner.id, 'approve')}>
                    {actionLoading === stadium.id ? (
                      <div className="inline-block w-3 h-3 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    ) : '✓ Approve Owner & Stadium'}
                  </button>
                ) : (
                  <button 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, stadium.owner.id, 'reject')}>
                    Reject
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
