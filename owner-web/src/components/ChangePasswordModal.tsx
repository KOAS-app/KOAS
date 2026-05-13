import { useState, type FormEvent } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

interface Props { onClose: () => void; }

export default function ChangePasswordModal({ onClose }: Props) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.next !== form.confirm) { setError('New passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: form.current, newPassword: form.next });
      setSuccess(true);
      setTimeout(onClose, 1600);
    } catch (err) {
      setError(getApiError(err, 'Failed to change password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl shadow-black/15 overflow-hidden border border-[#e5e7eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb] bg-gradient-to-r from-[#f9fafb] to-white">
          <div>
            <h2 className="text-[1rem] font-bold text-[#111827] tracking-tight">
              Update Password
            </h2>
            <p className="text-[0.8125rem] text-[#6b7280] mt-0.5">
              Keep your account secure and protected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#e5e7eb] bg-transparent flex items-center justify-center text-[#6b7280] transition-all hover:bg-[#f3f4f6] hover:text-[#111827]"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Success state */}
          {success && (
            <div className="flex items-center gap-3 px-4 py-3.5 mb-6 rounded-lg bg-[#ecfdf5] border border-[#d1fae5] animate-in fade-in slide-in-from-top-2 duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[#059669]">Password updated successfully</p>
                <p className="text-xs text-[#10b981] mt-0.5">Your password has been changed. Closing in a moment...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !success && (
            <div className="flex items-start gap-3 px-4 py-3.5 mb-6 rounded-lg bg-[#fef2f2] border border-[#fecaca] animate-in fade-in slide-in-from-top-2 duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#dc2626]">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="current"
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg bg-white text-[#111827] text-sm outline-none transition-all placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 disabled:bg-[#f9fafb] disabled:text-[#6b7280] disabled:cursor-not-allowed pr-11"
                  placeholder="••••••••"
                  value={form.current}
                  onChange={handleChange}
                  required
                  autoFocus
                  disabled={success}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#9ca3af] hover:text-[#4b5563] transition-colors disabled:opacity-50"
                  disabled={success}
                  aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.current ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.next ? 'text' : 'password'}
                  name="next"
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg bg-white text-[#111827] text-sm outline-none transition-all placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 disabled:bg-[#f9fafb] disabled:text-[#6b7280] disabled:cursor-not-allowed pr-11"
                  placeholder="Min. 6 characters"
                  value={form.next}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={success}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, next: !p.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#9ca3af] hover:text-[#4b5563] transition-colors disabled:opacity-50"
                  disabled={success}
                  aria-label={showPasswords.next ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.next ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm"
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg bg-white text-[#111827] text-sm outline-none transition-all placeholder:text-[#9ca3af] hover:border-[#9ca3af] focus:border-[#16a34a] focus:ring ring-[#16a34a]/20 disabled:bg-[#f9fafb] disabled:text-[#6b7280] disabled:cursor-not-allowed pr-11"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  disabled={success}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#9ca3af] hover:text-[#4b5563] transition-colors disabled:opacity-50"
                  disabled={success}
                  aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.confirm ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#6b7280] bg-[#f3f4f6] border border-[#e5e7eb] transition-all hover:bg-[#e5e7eb] hover:text-[#111827] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={success}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#16a34a] border border-[#16a34a] shadow-sm shadow-[#16a34a]/20 transition-all hover:bg-[#15803d] hover:shadow-md hover:shadow-[#16a34a]/30 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                      <path d="M9 2.756a9.971 9.971 0 0 1 12.224 5.858" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
