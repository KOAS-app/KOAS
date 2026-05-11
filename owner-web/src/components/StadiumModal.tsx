import { useState, FormEvent, useEffect } from 'react';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

interface Props {
  stadium: Stadium | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

export default function StadiumModal({ stadium, onClose, onSaved }: Props) {
  const isEdit = stadium !== null;

  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: stadium.name,
        location: stadium.location,
        description: stadium.description ?? '',
      });
    }
  }, [stadium, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/stadiums/${stadium.id}`, form);
      } else {
        await api.post('/stadiums', form);
      }
      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Failed to save stadium.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
        {/* Modal header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-base)' }}>
            {isEdit ? 'Edit Stadium' : 'Add Stadium'}
          </h2>
          <button
            onClick={onClose}
            className="text-lg leading-none"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="text-sm px-3 py-2 rounded mb-4"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Stadium Name</label>
            <input
              name="name"
              type="text"
              className="input"
              placeholder="e.g. Green Arena"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              name="location"
              type="text"
              className="input"
              placeholder="e.g. Addis Ababa, Bole"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span></label>
            <textarea
              name="description"
              className="input"
              placeholder="Describe your stadium..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Stadium'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
