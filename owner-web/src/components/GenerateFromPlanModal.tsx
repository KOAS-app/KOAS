import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { SubscriptionPlan } from '../types';

interface Props {
  stadiumId: string;
  stadiumLocations: string[];
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function GenerateFromPlanModal({ stadiumId, stadiumLocations, onClose, onSuccess }: Props) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subscriptionPlanId: '',
    location: stadiumLocations[0] || '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days from now
    slotDuration: '1',
    price: '',
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscription-plans/my');
        setPlans(res.data.filter((p: SubscriptionPlan) => p.isActive));
      } catch (err) {
        setError(getApiError(err, 'Failed to load subscription plans.'));
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const selectedPlan = plans.find(p => p.id === form.subscriptionPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/slots/generate-from-plan', form);
      onSuccess(res.data.created);
      onClose();
    } catch (err) {
      setError(getApiError(err, 'Failed to generate slots.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[520px] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              Generate Slots from Subscription Plan
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              Auto-create slots matching your plan's day and time constraints
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-muted)]">
                No active subscription plans found. Create a plan first.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Select Subscription Plan
                </label>
                <select
                  name="subscriptionPlanId"
                  value={form.subscriptionPlanId}
                  onChange={e => setForm(prev => ({ ...prev, subscriptionPlanId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  required
                >
                  <option value="">Choose a plan...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.openingDay}-{plan.closingDay}, {plan.openingTime}-{plan.closingTime})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <div className="p-3 rounded-lg bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)]">
                  <p className="text-[0.75rem] font-bold text-[var(--color-primary)] mb-1.5">Plan Constraints:</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-[0.75rem] text-[var(--color-text-secondary)]">
                      📅 Days: {selectedPlan.openingDay} - {selectedPlan.closingDay}
                    </p>
                    <p className="text-[0.75rem] text-[var(--color-text-secondary)]">
                      🕒 Hours: {selectedPlan.openingTime} - {selectedPlan.closingTime}
                    </p>
                    <p className="text-[0.75rem] text-[var(--color-text-secondary)]">
                      ⏱️ Max {selectedPlan.hoursPerDay || 1} hour(s) per day
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Location
                </label>
                <select
                  name="location"
                  value={form.location}
                  onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  required
                >
                  {stadiumLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Slot Duration (hours)
                </label>
                <input
                  type="number"
                  name="slotDuration"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={form.slotDuration}
                  onChange={e => setForm(prev => ({ ...prev, slotDuration: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder="e.g. 1 or 0.5"
                  required
                />
                <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-1.5">
                  Each slot will be this duration. Use 0.5 for 30 min, 1.5 for 90 min.
                </p>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Price per Slot (ETB)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder="e.g. 500"
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
                  disabled={submitting || !form.subscriptionPlanId}
                >
                  {submitting ? (
                    <>
                      <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Generate Slots
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
