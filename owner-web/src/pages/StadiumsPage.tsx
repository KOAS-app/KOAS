import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';
import StadiumModal from '../components/StadiumModal';

export default function StadiumsPage() {
  const navigate = useNavigate();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stadium | null>(null);

  const fetchStadiums = async () => {
    try {
      const res = await api.get('/stadiums/my');
      setStadiums(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load stadiums.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiums();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stadium? This cannot be undone.')) return;
    try {
      await api.delete(`/stadiums/${id}`);
      setStadiums((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(getApiError(err, 'Failed to delete stadium.'));
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    fetchStadiums();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title mb-2">My Stadiums</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage your stadium listings and bookings
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          + Add Stadium
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm px-4 py-3 rounded-lg mb-5"
          style={{ 
            backgroundColor: 'var(--color-danger-bg)', 
            color: 'var(--color-danger)',
            border: '1px solid #FECACA'
          }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading stadiums...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && stadiums.length === 0 && (
        <div className="card empty-state">
          <p className="empty-state-icon">🏟️</p>
          <p className="empty-state-title">No stadiums yet</p>
          <p className="empty-state-description">
            Add your first stadium to start accepting bookings
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            + Add Stadium
          </button>
        </div>
      )}

      {/* Stadium grid */}
      {!loading && stadiums.length > 0 && (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {stadiums.map((stadium) => (
            <div key={stadium.id} className="card flex flex-col gap-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg mb-1 truncate" style={{ color: 'var(--color-text-base)' }}>
                    {stadium.name}
                  </h2>
                  <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <span>📍</span>
                    <span className="truncate">{stadium.location}</span>
                  </p>
                </div>
                <span className={`badge ${stadium.isApproved ? 'badge-success' : 'badge-warning'}`}>
                  {stadium.isApproved ? '✓ Approved' : '⏳ Pending'}
                </span>
              </div>

              {/* Description */}
              {stadium.description && (
                <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {stadium.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  className="btn btn-ghost btn-sm flex-1"
                  onClick={() => navigate(`/stadiums/${stadium.id}/slots`)}
                >
                  🕐 Slots
                </button>
                <button
                  className="btn btn-ghost btn-sm flex-1"
                  onClick={() => navigate(`/stadiums/${stadium.id}/bookings`)}
                >
                  📋 Bookings
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditing(stadium); setModalOpen(true); }}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(stadium.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <StadiumModal
          stadium={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
