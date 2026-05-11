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
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">My Stadiums</h1>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          + Add Stadium
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm px-3 py-2 rounded mb-4"
          style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      )}

      {/* Empty */}
      {!loading && stadiums.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="font-medium" style={{ color: 'var(--color-text-base)' }}>
            No stadiums yet
          </p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Add your first stadium to get started
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
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {stadiums.map((stadium) => (
            <div key={stadium.id} className="card flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-base)' }}>
                    {stadium.name}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    📍 {stadium.location}
                  </p>
                </div>
                <span className={`badge ${stadium.isApproved ? 'badge-success' : 'badge-warning'}`}>
                  {stadium.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {/* Description */}
              {stadium.description && (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {stadium.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  className="btn btn-ghost text-xs flex-1"
                  onClick={() => navigate(`/stadiums/${stadium.id}/slots`)}
                >
                  🕐 Slots
                </button>
                <button
                  className="btn btn-ghost text-xs flex-1"
                  onClick={() => navigate(`/stadiums/${stadium.id}/bookings`)}
                >
                  📋 Bookings
                </button>
                <button
                  className="btn btn-ghost text-xs"
                  onClick={() => { setEditing(stadium); setModalOpen(true); }}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger text-xs"
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
