import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Location } from '../types';
import { getApiError } from '../utils/apiError';
import LocationModal from '../components/LocationModal';

export default function LocationsPage() {
  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);

      const stadiumRes = await api.get('/stadiums/my');
      const stadium = stadiumRes.data[0];

      if (!stadium) {
        setError('No stadium found. Please create a stadium first.');
        setLoading(false);
        return;
      }

      setStadiumId(stadium.id);

      const locsRes = await api.get(`/locations/stadium/${stadium.id}`);
      setLocations(locsRes.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load locations.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location? This cannot be undone.')) return;
    try {
      await api.delete(`/locations/${id}`);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(getApiError(err, 'Failed to delete location.'));
    }
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    fetchData();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setModalOpen(true);
  };

  // ── Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3.5 py-20">
        <div className="inline-block w-[1.625rem] h-[1.625rem] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-muted)] text-sm font-medium">
          Loading locations…
        </span>
      </div>
    );
  }

  // ── Error
  if (error && !stadiumId) {
    return (
      <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">Locations</h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Manage your stadium branch locations and their photos.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 mt-1 rounded-[10px] text-sm font-semibold tracking-tight text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
          onClick={openCreate}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Location
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3.5 mb-6 rounded-[10px] bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fca5a5] text-sm font-medium">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && locations.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-16 shadow-sm max-w-[480px] mx-auto text-center">
          <div className="text-5xl opacity-50 mb-4">📍</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No locations yet</p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md">
            Add branch locations for your stadium. Each location can have multiple photos.
          </p>
          <button
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[10px] text-[0.9375rem] font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
            onClick={openCreate}
          >
            Add Your First Location
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {locations.map(location => {
            const firstImage = location.images?.[0];

            return (
              <div
                key={location.id}
                className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-[var(--color-surface-muted)]">
                  {firstImage ? (
                    <img
                      src={`${apiUrl}${firstImage}`}
                      alt={location.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl opacity-30">📍</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📍</div>
                  )}

                  {/* Image count badge */}
                  {location.images && location.images.length > 1 && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.6875rem] font-bold bg-[rgba(0,0,0,0.6)] text-white backdrop-blur-sm border border-white/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {location.images.length}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-[1.25rem_1.375rem] flex flex-col gap-2 flex-1">
                  <h3 className="text-[1rem] font-black tracking-tight text-[var(--color-text-base)]">
                    {location.name}
                  </h3>

                  {location.address && (
                    <p className="text-[0.8125rem] text-[var(--color-text-muted)] leading-relaxed flex items-start gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-[var(--color-primary)]">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {location.address}
                    </p>
                  )}

                  {/* Image thumbnails */}
                  {location.images && location.images.length > 1 && (
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {location.images.slice(0, 5).map((img, i) => (
                        <div key={i} className="w-8 h-8 rounded-md overflow-hidden border border-[var(--color-border)] flex-shrink-0">
                          <img
                            src={`${apiUrl}${img}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {location.images.length > 5 && (
                        <span className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[0.6875rem] font-bold text-[var(--color-text-muted)]">
                          +{location.images.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-[var(--color-border)] -mx-[1.375rem] mt-2" />

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
                      onClick={() => openEdit(location)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
                      onClick={() => handleDelete(location.id)}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && stadiumId && (
        <LocationModal
          location={editing}
          stadiumId={stadiumId}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
