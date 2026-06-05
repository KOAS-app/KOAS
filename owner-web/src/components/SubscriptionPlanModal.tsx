import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import type { SubscriptionPlan } from '../types';

interface Props {
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionPlanModal({ plan, onClose, onSuccess }: Props) {
  const isEdit = plan !== null;
  const [step, setStep] = useState<'plan' | 'slots'>('plan');
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);
  const [stadiumData, setStadiumData] = useState<{ id: string; locations: string[] } | null>(null);
  const [loadingStadium, setLoadingStadium] = useState(true);

  // Fetch stadium data on mount to get locations
  useEffect(() => {
    const fetchStadium = async () => {
      try {
        const res = await api.get('/stadiums/my');
        const stadium = res.data[0];
        setStadiumData({ id: stadium.id, locations: (stadium.locations || []).map((l: any) => l.name) });
      } catch (err) {
        console.error('Failed to fetch stadium:', err);
      } finally {
        setLoadingStadium(false);
      }
    };
    fetchStadium();
  }, []);

  // Helper to split AM/PM string into parts
  const getInitialTime = (timeStr: string | undefined, fallback: string) => {
    const val = timeStr || fallback;
    const [h, rest] = val.split(':');
    const [m, period] = rest.split(' ');
    return { hour: h, minute: m, period };
  };

  const openTimeInit = getInitialTime(plan?.openingTime, '08:00 AM');
  const closeTimeInit = getInitialTime(plan?.closingTime, '10:00 PM');

  const [form, setForm] = useState({
    name: plan?.name || '',
    price: plan?.price !== undefined ? plan.price : '',
    duration: plan?.duration !== undefined ? plan.duration : '',
    description: plan?.description || '',
    isActive: plan?.isActive !== undefined ? plan.isActive : true,
    location: plan?.location || '',
    openingDay: plan?.openingDay || 'Monday',
    closingDay: plan?.closingDay || 'Sunday',
    openHour: openTimeInit.hour,
    openMinute: openTimeInit.minute,
    openPeriod: openTimeInit.period,
    closeHour: closeTimeInit.hour,
    closeMinute: closeTimeInit.minute,
    closePeriod: closeTimeInit.period,
    weeklyAllowedDays: plan?.weeklyAllowedDays !== undefined ? plan.weeklyAllowedDays : 1,
    hoursPerDay: plan?.hoursPerDay !== undefined ? plan.hoursPerDay : 1,
  });

  const [slotForm, setSlotForm] = useState({
    location: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    slotDuration: '1',
    slotPrice: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleToggle = () => {
    setForm(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Prepare values matching schema types
    const payload = {
      name: form.name,
      price: Number(form.price),
      duration: Number(form.duration),
      description: form.description || null,
      isActive: form.isActive,
      location: form.location || null,
      openingTime: `${form.openHour}:${form.openMinute} ${form.openPeriod}`,
      closingTime: `${form.closeHour}:${form.closeMinute} ${form.closePeriod}`,
      openingDay: form.openingDay,
      closingDay: form.closingDay,
      weeklyAllowedDays: Number(form.weeklyAllowedDays),
      hoursPerDay: Number(form.hoursPerDay),
    };

    try {
      if (isEdit) {
        await api.put(`/subscription-plans/${plan.id}`, payload);
        onSuccess();
      } else {
        // Create plan and move to slot generation step
        const res = await api.post('/subscription-plans', payload);
        setCreatedPlanId(res.data.id);
        
        // Fetch stadium data for locations
        const stadiumRes = await api.get('/stadiums/my');
        const stadium = stadiumRes.data[0];
        const locNames = (stadium.locations || []).map((l: any) => l.name);
        setStadiumData({ id: stadium.id, locations: locNames });
        
        // Use plan's location for slot generation
        setSlotForm(prev => ({ ...prev, location: form.location || locNames[0] || '' }));
        
        setStep('slots');
      }
    } catch (err) {
      setError(getApiError(err, `Failed to ${isEdit ? 'update' : 'add'} subscription plan.`));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/slots/generate-from-plan', {
        subscriptionPlanId: createdPlanId,
        location: slotForm.location,
        startDate: slotForm.startDate,
        endDate: slotForm.endDate,
        slotDuration: slotForm.slotDuration,
        price: slotForm.slotPrice,
      });
      onSuccess();
    } catch (err) {
      setError(getApiError(err, 'Failed to generate slots.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSkipSlots = () => {
    onSuccess();
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[480px] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              {step === 'plan' 
                ? (isEdit ? 'Edit Subscription Plan' : 'Add Subscription Plan')
                : 'Generate Slots for Plan'}
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {step === 'plan'
                ? (isEdit ? 'Update details of your package.' : 'Step 1: Create your subscription plan')
                : 'Step 2: Auto-generate time slots matching your plan'}
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
        {step === 'plan' ? (
          <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Plan Name
              </label>
              <input
                name="name"
                type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                placeholder="e.g. Monthly Pass, Premium Club Card"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Price (ETB)
                </label>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="any"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                  placeholder="e.g. 1500"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Duration (Days)
                </label>
                <input
                  name="duration"
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                  placeholder="e.g. 30, 90"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Location
              </label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                required
              >
                <option value="">Select location</option>
                {stadiumData?.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-1.5">
                This plan will only apply to the selected location
              </p>
            </div>

            {/* Allowed Days row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Opening Day
                </label>
                <select
                  name="openingDay"
                  value={form.openingDay}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Closing Day
                </label>
                <select
                  name="closingDay"
                  value={form.closingDay}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Allowed Hours row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Opening Time
                </label>
                <div className="flex gap-1">
                  <select
                    name="openHour"
                    value={form.openHour}
                    onChange={handleChange}
                    className="flex-1 px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select
                    name="openMinute"
                    value={form.openMinute}
                    onChange={handleChange}
                    className="flex-1 px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    name="openPeriod"
                    value={form.openPeriod}
                    onChange={handleChange}
                    className="px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Closing Time
                </label>
                <div className="flex gap-1">
                  <select
                    name="closeHour"
                    value={form.closeHour}
                    onChange={handleChange}
                    className="flex-1 px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select
                    name="closeMinute"
                    value={form.closeMinute}
                    onChange={handleChange}
                    className="flex-1 px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    name="closePeriod"
                    value={form.closePeriod}
                    onChange={handleChange}
                    className="px-1.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Allowed Play Days per Week
                </label>
                <select
                  name="weeklyAllowedDays"
                  value={form.weeklyAllowedDays}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Day' : 'Days'} per week
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Hours per Day
                </label>
                <select
                  name="hoursPerDay"
                  value={form.hoursPerDay}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Hour' : 'Hours'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Plan Description & Benefits
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white resize-none"
                placeholder="List benefits, one per line (e.g. Free water, access to 4 weekend slots...)"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between py-2 px-1 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg">
              <span className="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] pl-2">
                Active Status
              </span>
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mr-2 ${
                  form.isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                ) : isEdit ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </form>
        ) : (
          <form onSubmit={handleGenerateSlots} className="p-6">
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Info Banner */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 mb-5 rounded-[10px] bg-[#f0fdf4] border border-[#bbf7d0]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div className="text-[0.75rem] leading-relaxed text-[#166534]">
                <p className="font-bold mb-0.5">Generate slots to enable bookings</p>
                <p>
                  Players who want to book manually need available time slots. 
                  Subscription members also need slots to reserve their play time.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Plan constraints preview */}
              <div className="p-3 rounded-lg bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)]">
                <p className="text-[0.75rem] font-bold text-[var(--color-primary)] mb-1.5">Plan: {form.name}</p>
                <div className="flex flex-col gap-1">
                  <p className="text-[0.75rem] text-[var(--color-text-secondary)]">
                    📅 {form.openingDay} - {form.closingDay}
                  </p>
                  <p className="text-[0.75rem] text-[var(--color-text-secondary)]">
                    🕒 {form.openHour}:{form.openMinute} {form.openPeriod} - {form.closeHour}:{form.closeMinute} {form.closePeriod}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Location
                </label>
                <select
                  value={slotForm.location}
                  onChange={e => setSlotForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  required
                >
                  {stadiumData?.locations.map(loc => (
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
                    value={slotForm.startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setSlotForm(prev => ({ ...prev, startDate: e.target.value }))}
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
                    value={slotForm.endDate}
                    min={slotForm.startDate}
                    onChange={e => setSlotForm(prev => ({ ...prev, endDate: e.target.value }))}
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
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={slotForm.slotDuration}
                  onChange={e => setSlotForm(prev => ({ ...prev, slotDuration: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder="e.g. 1 or 0.5"
                  required
                />
                <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-1.5">
                  Use 0.5 for 30 min, 1.5 for 90 min
                </p>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                  Price per Slot (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  value={slotForm.slotPrice}
                  onChange={e => setSlotForm(prev => ({ ...prev, slotPrice: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder="e.g. 500"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSkipSlots}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? (
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
          </form>
        )}
      </div>
    </div>
  );
}
