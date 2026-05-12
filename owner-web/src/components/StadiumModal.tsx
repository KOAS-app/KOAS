import { useState, FormEvent, useEffect } from 'react';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

interface Props {
  stadium: Stadium | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function StadiumModal({ stadium, onClose, onSaved }: Props) {
  const isEdit = stadium !== null;
  const [form, setForm]       = useState({ name: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (isEdit) setForm({ name: stadium.name, location: stadium.location, description: stadium.description ?? '' });
  }, [stadium, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/stadiums/${stadium.id}`, form);
      else        await api.post('/stadiums', form);
      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Failed to save stadium.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[480px] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              {isEdit ? 'Edit Stadium' : 'Add Stadium'}
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {isEdit ? 'Update your turf profile details.' : 'Fill in the details to register your turf.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-base)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Stadium Name</label>
              <input
                name="name" type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g. Green Arena"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Location</label>
              <input
                name="location" type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g. Addis Ababa, Bole"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Description
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>
              <textarea
                name="description"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed resize-y min-h-[80px]"
                placeholder="Describe your turf — surface, capacity, facilities…"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : isEdit ? 'Save Changes' : 'Add Stadium'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
