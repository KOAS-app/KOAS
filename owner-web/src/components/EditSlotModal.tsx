import { useState } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { Slot } from '../types';

interface Props {
  slot: Slot;
  stadiumLocations: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSlotModal({ slot, stadiumLocations, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    location: slot.location,
    startTime: slot.startTime.slice(0, 16),
    endTime: slot.endTime.slice(0, 16),
    price: slot.price.toString(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body: Record<string, unknown> = {};
    if (form.location !== slot.location) body.location = form.location;
    if (form.startTime !== slot.startTime.slice(0, 16)) body.startTime = form.startTime;
    if (form.endTime !== slot.endTime.slice(0, 16)) body.endTime = form.endTime;
    if (form.price !== slot.price.toString()) body.price = form.price;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    try {
      await api.put(`/slots/${slot.id}`, body);
      onSuccess();
    } catch (err) {
      setError(getApiError(err, 'Failed to update slot.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[440px] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              Edit Slot
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              Update slot details. Only unbooked slots can be edited.
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
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Location</label>
              <select
                name="location"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                value={form.location}
                onChange={handleChange}
              >
                {stadiumLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Start Time</label>
              <input
                name="startTime"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">End Time</label>
              <input
                name="endTime"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Price (ETB)</label>
              <input
                name="price"
                type="number"
                min={0}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
