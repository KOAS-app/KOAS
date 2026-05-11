import { useState, type FormEvent } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.next !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(getApiError(err, 'Failed to change password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-sm" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-base)' }}>
            Change Password
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }} aria-label="Close">✕</button>
        </div>

        {error && (
          <div className="text-sm px-3 py-2 rounded mb-4"
            style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm px-3 py-2 rounded mb-4"
            style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
            ✓ Password changed successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input name="current" type="password" className="input"
              placeholder="••••••••" value={form.current}
              onChange={handleChange} required autoFocus />
          </div>
          <div>
            <label className="label">New Password</label>
            <input name="next" type="password" className="input"
              placeholder="••••••••" value={form.next}
              onChange={handleChange} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input name="confirm" type="password" className="input"
              placeholder="••••••••" value={form.confirm}
              onChange={handleChange} required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading || success}>
              {loading ? 'Saving…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
