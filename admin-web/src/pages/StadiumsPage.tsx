import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Stadium } from '../types';
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

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await api.patch(`/admin/stadiums/${id}/${action}`);
      setStadiums((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isApproved: res.data.isApproved } : s))
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
      <h1 className="page-title">Stadiums</h1>

      {/* Filter */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit"
        style={{ backgroundColor: 'var(--color-surface-muted)' }}>
        {(['ALL', 'PENDING', 'APPROVED'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--color-surface-card)' : 'transparent',
              color: filter === f ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: filter === f ? 'var(--shadow-card)' : 'none',
            }}>
            {f}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">🏟️</p>
          <p style={{ color: 'var(--color-text-muted)' }}>No stadiums found</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card p-0 overflow-hidden">
          {filtered.map((stadium, i) => (
            <div key={stadium.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-base)' }}>
                  {stadium.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  📍 {stadium.location} · Owner: {stadium.owner.name}
                </p>
              </div>

              {/* Status */}
              <span className={`badge ${stadium.isApproved ? 'badge-success' : 'badge-warning'}`}>
                {stadium.isApproved ? 'Approved' : 'Pending'}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                {!stadium.isApproved ? (
                  <button className="btn btn-accent text-xs"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, 'approve')}>
                    ✓ Approve
                  </button>
                ) : (
                  <button className="btn btn-ghost text-xs"
                    disabled={actionLoading === stadium.id}
                    onClick={() => handleAction(stadium.id, 'reject')}>
                    Revoke
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
