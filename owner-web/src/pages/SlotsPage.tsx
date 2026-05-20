import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Slot } from '../types';
import { getApiError } from '../utils/apiError';
import { useAuth } from '../context/AuthContext';
import { getActiveTier, TIER_LIMITS } from '../utils/tier';

type Tab = 'bulk' | 'single';

interface BulkForm  { location: string; date: string; openHour: string; closeHour: string; duration: string; price: string; }
interface SingleForm { location: string; startTime: string; endTime: string; price: string; }

const fmt     = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });


export default function SlotsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const activeTier = getActiveTier(user);
  const limits = TIER_LIMITS[activeTier];
  const hasAutoSlots = limits.autoSlotGenerator;

  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [stadiumLocations, setStadiumLocations] = useState<string[]>([]);
  const [slots, setSlots]         = useState<Slot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tab, setTab]             = useState<Tab>('bulk');
  const [saving, setSaving]       = useState(false);

  const [single, setSingle] = useState<SingleForm>({ location: '', startTime: '', endTime: '', price: '' });
  const [bulk, setBulk]     = useState<BulkForm>({
    location: '',
    date: new Date().toISOString().slice(0, 10),
    openHour: '08:00', closeHour: '22:00', duration: '1', price: '',
  });

  const fetchStadiumAndSlots = async () => {
    try {
      // First get the stadium
      const stadiumRes = await api.get('/stadiums/my');
      const stadium = stadiumRes.data[0];
      
      if (!stadium) {
        setError('No stadium found. Please create a stadium first.');
        setLoading(false);
        return;
      }

      setStadiumId(stadium.id);
      setStadiumLocations(stadium.locations || []);

      // Set default location if available
      if (stadium.locations && stadium.locations.length > 0) {
        setBulk(prev => ({ ...prev, location: stadium.locations[0] }));
        setSingle(prev => ({ ...prev, location: stadium.locations[0] }));
      }

      // Then fetch slots
      const res = await api.get(`/slots/${stadium.id}`);
      setSlots(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load slots.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStadiumAndSlots(); }, []);

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const timeToFloat = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    if (!stadiumId) return;

    const selectedDate = new Date(bulk.date);
    const today = new Date();
    const closeFloat = timeToFloat(bulk.closeHour);
    
    if (selectedDate.toDateString() === today.toDateString()) {
      if (closeFloat <= today.getHours() + today.getMinutes() / 60) {
        setError('The selected time range is already in the past.');
        setSaving(false);
        return;
      }
    }

    try {
      const res = await api.post('/slots/bulk', {
        stadiumId, location: bulk.location, date: bulk.date,
        openHour: timeToFloat(bulk.openHour), closeHour: closeFloat, 
        duration: parseFloat(bulk.duration), price: bulk.price,
      });
      flash(`${res.data.created} slot(s) generated.`);
      fetchStadiumAndSlots();
    } catch (err) { setError(getApiError(err, 'Failed to generate slots.')); }
    finally { setSaving(false); }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    if (!stadiumId) return;

    if (new Date(single.startTime) < new Date()) {
      setError('Cannot create a slot in the past.');
      setSaving(false);
      return;
    }

    try {
      await api.post('/slots', { stadiumId, ...single });
      setSingle({ location: stadiumLocations[0] || '', startTime: '', endTime: '', price: '' });
      flash('Slot created.');
      fetchStadiumAndSlots();
    } catch (err) { setError(getApiError(err, 'Failed to create slot.')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (slotId: string, isBooked: boolean) => {
    const msg = isBooked 
      ? 'This slot is currently booked. Deleting it will also cancel and delete the associated booking and payment. Are you sure?' 
      : 'Delete this slot?';
    if (!confirm(msg)) return;
    try {
      await api.delete(`/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch (err) { alert(getApiError(err, 'Failed to delete slot.')); }
  };

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.startTime).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/stadiums')}
          className="inline-flex items-center justify-center p-2 rounded-lg flex-shrink-0 text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-0">Slot Manager</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Create and manage availability for this stadium.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left: Form panel */}
        <div className="lg:sticky lg:top-20 flex flex-col gap-4">
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-6 shadow-sm">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-[var(--color-surface-muted)] rounded-[10px] mb-6 border border-[var(--color-border)]">
              {(['bulk', 'single'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg border-none cursor-pointer text-[0.8125rem] font-bold transition-all ${
                    tab === t
                      ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-sm'
                      : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {t === 'bulk' ? '⚡ Bulk Generate' : '+ Single Slot'}
                </button>
              ))}
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-success-bg)] border border-[#bbf7d0] text-[#15803d] text-[0.8125rem] font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {successMsg}
              </div>
            )}

            {/* Bulk form */}
            {tab === 'bulk' && (
              !hasAutoSlots ? (
                <div className="relative overflow-hidden rounded-[12px] p-6 bg-gradient-to-b from-[#0a140f] to-[#0c1f15] border border-[rgba(74,222,128,0.25)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center min-h-[340px] flex flex-col items-center justify-center select-none">
                  {/* Glowing background gradient elements */}
                  <div className="absolute top-[-10%] left-[-10%] w-24 h-24 rounded-full bg-[var(--color-primary)] opacity-10 blur-xl pointer-events-none" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-24 h-24 rounded-full bg-[#4ade80] opacity-10 blur-xl pointer-events-none" />

                  {/* Icon */}
                  <div className="relative w-14 h-14 rounded-full bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-[#4ade80] text-xl mb-4 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>

                  <h3 className="text-[1.0625rem] font-black text-white tracking-tight leading-tight">
                    Automatic Slot Generator
                  </h3>
                  <p className="text-[var(--color-warning)] text-[0.6875rem] font-extrabold uppercase tracking-widest mt-1.5 bg-[rgba(217,119,6,0.1)] border border-[rgba(217,119,6,0.2)] px-2 py-0.5 rounded-full select-none">
                    Premium Feature
                  </p>
                  
                  <p className="text-[0.8125rem] text-white/70 mt-3.5 leading-relaxed max-w-[260px]">
                    Instantly generate optimized hourly slot calendars for full calendar days. Avoid tedious manual entries.
                  </p>

                  <div className="w-full h-px bg-white/[0.06] my-4" />

                  <p className="text-[0.75rem] text-white/50 mb-4 max-w-[240px]">
                    Automatic scheduling is available on our <strong className="text-white">Pro</strong> and <strong className="text-white">Elite</strong> plans.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-[10px] text-xs font-bold text-white bg-gradient-to-r from-[#16a34a] to-[#15803d] border border-transparent shadow-[0_4px_12px_rgba(22,163,74,0.3)] transition-all hover:from-[#15803d] hover:to-[#16a34a] hover:-translate-y-px active:translate-y-0"
                  >
                    Upgrade to PRO
                    <span className="inline-block transition-transform hover:translate-x-0.5">&rarr;</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Location</label>
                    <select
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      value={bulk.location}
                      onChange={e => setBulk(p => ({ ...p, location: e.target.value }))}
                      required
                    >
                      <option value="">Select location</option>
                      {stadiumLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Date</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      value={bulk.date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => setBulk(p => ({ ...p, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Open Time</label>
                      <input
                        type="time"
                        className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                        value={bulk.openHour}
                        onChange={e => setBulk(p => ({ ...p, openHour: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Close Time</label>
                      <input
                        type="time"
                        className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                        value={bulk.closeHour}
                        onChange={e => setBulk(p => ({ ...p, closeHour: e.target.value }))}
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
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="e.g. 1 or 0.5 for 30 min"
                      value={bulk.duration}
                      onChange={e => setBulk(p => ({ ...p, duration: e.target.value }))}
                      required
                    />
                    <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                      Enter duration in hours. For 30 minutes use <strong className="text-[var(--color-text-secondary)]">0.5</strong>, for 90 minutes use <strong className="text-[var(--color-text-secondary)]">1.5</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Price per slot (ETB)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="e.g. 500"
                      min={0}
                      value={bulk.price}
                      onChange={e => setBulk(p => ({ ...p, price: e.target.value }))}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 mt-1 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </form>
              )
            )}

            {/* Single form */}
            {tab === 'single' && (
              <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Location</label>
                  <select
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={single.location}
                    onChange={e => setSingle(p => ({ ...p, location: e.target.value }))}
                    required
                  >
                    <option value="">Select location</option>
                    {stadiumLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={single.startTime}
                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    onChange={e => setSingle(p => ({ ...p, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={single.endTime}
                    min={single.startTime || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    onChange={e => setSingle(p => ({ ...p, endTime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Price (ETB)</label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="e.g. 500"
                    min={0}
                    value={single.price}
                    onChange={e => setSingle(p => ({ ...p, price: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 mt-1 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Add Slot'}
                </button>
              </form>
            )}
          </div>

          {/* Tip card */}
          <div className="px-4.5 py-4 rounded-[10px] bg-[var(--color-primary-bg)] border border-[#bbf7d0]">
            <p className="text-[0.8125rem] font-bold text-[var(--color-primary)] mb-1">
              💡 Tip
            </p>
            <p className="text-[0.8125rem] text-[#166534] leading-relaxed">
              Use <strong>Bulk Generate</strong> to create slots for a full day at once. Choose your preferred slot duration (30 min to 8 hours). Delete individual slots if needed.
            </p>
          </div>
        </div>

        {/* Right: Slot list */}
        <div className="flex flex-col gap-6">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              <span className="text-[var(--color-text-muted)] text-sm">Loading schedule…</span>
            </div>
          )}

          {!loading && slots.length === 0 && (
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
              <div className="text-5xl opacity-50 mb-4">🕐</div>
              <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No slots yet</p>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">Use the form on the left to generate your first time slots.</p>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([day, daySlots]) => (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3.5 mb-3">
                <h3 className="text-[0.8125rem] font-bold text-[var(--color-text-secondary)] tracking-tight whitespace-nowrap">
                  {fmtDate(daySlots[0].startTime)}
                </h3>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap">
                  {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Slot items */}
              <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm overflow-hidden">
                {daySlots.map((slot, i) => (
                  <div
                    key={slot.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 transition-all hover:bg-[var(--color-surface-muted)] ${
                      i < daySlots.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                    } ${slot.isBooked ? 'bg-[var(--color-surface-muted)] opacity-75' : 'bg-transparent'}`}
                  >
                    {/* Status dot + time + location */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 sm:mt-0 ${
                        slot.isBooked 
                          ? 'bg-[var(--color-danger)]' 
                          : 'bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.9375rem] font-bold text-[var(--color-text-base)] tracking-tight">
                            {fmt(slot.startTime)} – {fmt(slot.endTime)}
                          </span>
                          <span className={`ml-1 px-2 py-0.5 rounded-md text-[0.6875rem] font-bold tracking-wide ${
                            slot.isBooked 
                              ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[#fecaca]' 
                              : 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[#bbf7d0]'
                          }`}>
                            {slot.isBooked ? 'Reserved' : 'Available'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-[0.75rem] text-[var(--color-text-muted)] font-medium">
                            {slot.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price + delete */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
                      <div className="text-right">
                        <span className="text-[1rem] font-black text-[var(--color-primary)] tracking-tight">
                          {slot.price.toLocaleString()}
                        </span>
                        <span className="text-[0.6875rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wide ml-1.5">
                          ETB
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(slot.id, slot.isBooked)}
                        title="Delete slot"
                        className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
