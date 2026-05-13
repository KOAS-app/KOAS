import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';
import StadiumModal from '../components/StadiumModal';

export default function StadiumsPage() {
  const navigate = useNavigate();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Stadium | null>(null);

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

  useEffect(() => { fetchStadiums(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stadium? This cannot be undone.')) return;
    try {
      await api.delete(`/stadiums/${id}`);
      setStadiums(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(getApiError(err, 'Failed to delete stadium.'));
    }
  };

  const handleSaved = () => { setModalOpen(false); setEditing(null); fetchStadiums(); };
  const openCreate  = () => { setEditing(null); setModalOpen(true); };
  const openEdit    = (s: Stadium) => { setEditing(s); setModalOpen(true); };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-1.5">My Stadiums</h1>
          <p className="text-[var(--color-text-muted)] text-[0.9375rem] -mt-1">
            Manage your turf listings, time slots, and bookings.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 mt-1 rounded-[10px] text-sm font-semibold tracking-tight text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
          onClick={openCreate}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Stadium
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3.5 py-20">
          <div className="inline-block w-[1.625rem] h-[1.625rem] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-[var(--color-text-muted)] text-sm font-medium">
            Loading stadiums…
          </span>
        </div>
      )}

      {/* Empty */}
      {!loading && stadiums.length === 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-16 shadow-sm max-w-[480px] mx-auto text-center">
          <div className="text-5xl opacity-50 mb-4">🏟️</div>
          <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No stadiums yet</p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md">
            Register your first turf to start managing time slots and accepting player bookings.
          </p>
          <button
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-[10px] text-[0.9375rem] font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
            onClick={openCreate}
          >
            Register Your First Turf
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && stadiums.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-5">
          {stadiums.map(stadium => (
            <StadiumCard
              key={stadium.id}
              stadium={stadium}
              onSlots={() => navigate(`/stadiums/${stadium.id}/slots`)}
              onBookings={() => navigate(`/stadiums/${stadium.id}/bookings`)}
              onEdit={() => openEdit(stadium)}
              onDelete={() => handleDelete(stadium.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
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

/* Stadium Card */
interface CardProps {
  stadium: Stadium;
  onSlots: () => void;
  onBookings: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function StadiumCard({ stadium, onSlots, onBookings, onEdit, onDelete }: CardProps) {
  const approved = stadium.isApproved;

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]">
      {/* Status bar */}
      <div className={`h-[2px] ${approved ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-warning)]'}`} />

      <div className="p-[1.25rem_1.375rem] flex flex-col gap-3.5 flex-1">
        {/* Identity row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-[1rem] font-black tracking-tight text-[var(--color-text-base)] mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {stadium.name}
            </h2>
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-[0.8125rem]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-primary)]">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                {stadium.location}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-bold tracking-wide border flex-shrink-0 ${
            approved 
              ? 'bg-[var(--color-success-bg)] text-[#15803d] border-[#bbf7d0]' 
              : 'bg-[var(--color-warning-bg)] text-[#b45309] border-[#fde68a]'
          }`}>
            {approved ? 'Live' : 'Pending'}
          </span>
        </div>

        {/* Description */}
        {stadium.description && (
          <p className="text-[0.8125rem] text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
            {stadium.description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)] -mx-[1.375rem]" />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
            onClick={onSlots}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Slots
          </button>
          <button
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
            onClick={onBookings}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Bookings
          </button>
        </div>

        {/* Edit / Delete */}
        <div className="flex gap-2">
          <button
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
            onClick={onEdit}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
            onClick={onDelete}
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
}
