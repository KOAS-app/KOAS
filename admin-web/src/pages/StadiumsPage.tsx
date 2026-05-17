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

  return (
    <div>
      <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-6">Stadiums</h1>

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
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden">
          {filtered.map((stadium, i) => (
            <div key={stadium.id}
              className="flex items-center justify-between px-5 py-4 gap-4 transition-all hover:bg-[var(--color-surface-muted)]"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[0.9375rem] text-[var(--color-text-base)] tracking-tight">
                  {stadium.name}
                </p>
                <p className="text-xs mt-1 text-[var(--color-text-muted)] font-medium">
                  📍 {stadium.locations.length === 1 ? stadium.locations[0] : `${stadium.locations.length} locations`} · Owner: {stadium.owner.name}
                </p>
              </div>

              {/* Status */}
              <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border ${
                stadium.isApproved 
                  ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]' 
                  : 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]'
              }`}>
                {stadium.isApproved ? 'Approved' : 'Pending'}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                {!stadium.isApproved ? (
                  <button 
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(59,130,246,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(59,130,246,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, stadium.owner.id, 'approve')}>
                    {actionLoading === stadium.id ? (
                      <div className="inline-block w-3 h-3 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    ) : '✓ Approve Owner & Stadium'}
                  </button>
                ) : (
                  <button 
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, stadium.owner.id, 'reject')}>
                    Revoke Owner
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
