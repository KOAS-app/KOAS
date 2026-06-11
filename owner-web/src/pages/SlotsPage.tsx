import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Slot } from '../types';
import { getApiError } from '../utils/apiError';
import { useAuth } from '../context/AuthContext';
import { getActiveTier, TIER_LIMITS } from '../utils/tier';
import GenerateFromPlanModal from '../components/GenerateFromPlanModal';
import EditSlotModal from '../components/EditSlotModal';

type Tab = 'bulk' | 'single';

interface BulkForm  { location: string; date: string; openHour: string; closeHour: string; duration: string; price: string; }
interface SingleForm { location: string; startTime: string; endTime: string; price: string; }

const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
const toLocalDatetime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


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
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked'>('all');
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());

  const [single, setSingle] = useState<SingleForm>({ location: '', startTime: '', endTime: '', price: '' });
  const [bulk, setBulk]     = useState<BulkForm>({
    location: '',
    date: toLocalDatetime(new Date()).slice(0, 10),
    openHour: '08:00', closeHour: '22:00', duration: '1', price: '',
  });

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() - ((day + 6) % 7));
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEnd = new Date(weekDays[6]);
  weekEnd.setHours(23, 59, 59, 999);

  const MIN_HOUR = 5;
  const MAX_HOUR = 23;
  const HALF_HOUR_COUNT = (MAX_HOUR - MIN_HOUR) * 2;
  const halfHourSlots = Array.from({ length: HALF_HOUR_COUNT }, (_, i) => {
    const totalMinutes = MIN_HOUR * 60 + i * 30;
    const h = Math.floor(totalMinutes / 60);
    return {
      hour: h,
      minutes: totalMinutes % 60,
      isHour: totalMinutes % 60 === 0,
      label: h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`,
    };
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
      const locNames = (stadium.locations || []).map((l: any) => l.name);
      setStadiumLocations(locNames);

      // Set default location if available
      if (stadium.locations && stadium.locations.length > 0) {
        setBulk(prev => ({ ...prev, location: locNames[0] }));
        setSingle(prev => ({ ...prev, location: locNames[0] }));
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
    const openFloat = timeToFloat(bulk.openHour);
    const closeFloat = timeToFloat(bulk.closeHour);
    const nowFloat = today.getHours() + today.getMinutes() / 60;
    
    if (selectedDate.toDateString() === today.toDateString()) {
      if (closeFloat <= nowFloat) {
        setError('The selected time range is already in the past.');
        setSaving(false);
        return;
      }
      if (openFloat < nowFloat) {
        setError('Open time is in the past. Slots cannot be created for past times.');
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
      await api.post('/slots', {
        stadiumId, location: single.location,
        startTime: single.startTime + ':00Z',
        endTime: single.endTime + ':00Z',
        price: single.price,
      });
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

  const filteredSlots = slots
    .filter(s => locationFilter === 'all' || s.location === locationFilter)
    .filter(s => statusFilter === 'all' || (statusFilter === 'available' && !s.isBooked) || (statusFilter === 'booked' && s.isBooked));

  const weekSlots = filteredSlots.filter(s => {
    const sd = new Date(s.startTime);
    return sd >= weekStart && sd <= weekEnd;
  });

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
        <div className="flex-1">
          <h1 className="text-[1.625rem] font-extrabold tracking-tight text-[var(--color-text-base)] leading-tight mb-0">Slot Manager</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
            Create and manage availability for this stadium.
          </p>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          From Plan
        </button>
      </div>

      {showPlanModal && stadiumId && (
        <GenerateFromPlanModal
          stadiumId={stadiumId}
          stadiumLocations={stadiumLocations}
          onClose={() => setShowPlanModal(false)}
          onSuccess={(count) => {
            flash(`${count} slot(s) generated from subscription plan.`);
            fetchStadiumAndSlots();
          }}
        />
      )}

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
                    onClick={() => navigate('/subscription-plans')}
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
                      min={toLocalDatetime(new Date()).slice(0, 10)}
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
                    min={toLocalDatetime(new Date())}
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
                    min={single.startTime || toLocalDatetime(new Date())}
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
          {/* Stats summary */}
          {!loading && slots.length > 0 && (
            <div className="flex items-center gap-4 px-5 py-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[12px] shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)]">Total</span>
                <span className="text-[1.0625rem] font-black text-[var(--color-text-base)]">{weekSlots.length}</span>
              </div>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]" />
                <span className="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)]">Available</span>
                <span className="text-[1.0625rem] font-black text-[var(--color-success)]">{weekSlots.filter(s => !s.isBooked).length}</span>
              </div>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                <span className="text-[0.8125rem] font-semibold text-[var(--color-text-secondary)]">Booked</span>
                <span className="text-[1.0625rem] font-black text-[var(--color-danger)]">{weekSlots.filter(s => s.isBooked).length}</span>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Location filter */}
            {stadiumLocations.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[0.75rem] font-semibold text-[var(--color-text-muted)] tracking-tight uppercase">Location:</span>
                <select
                  className="px-3 py-2 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.8125rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]"
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {stadiumLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem] font-semibold text-[var(--color-text-muted)] tracking-tight uppercase">Status:</span>
              <div className="flex gap-1 p-1 bg-[var(--color-surface-muted)] rounded-[10px] border border-[var(--color-border)]">
                {(['all', 'available', 'booked'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold transition-all ${
                      statusFilter === s
                        ? 'bg-[var(--color-surface-card)] text-[var(--color-text-base)] shadow-sm'
                        : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {s === 'all' ? 'All' : s === 'available' ? 'Available' : 'Booked'}
                  </button>
                ))}
              </div>
            </div>

            {/* Week navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; })}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                title="Previous week"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="px-3 py-1.5 text-[0.8125rem] font-bold text-[var(--color-text-secondary)] whitespace-nowrap select-none">
                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; })}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
                title="Next week"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                onClick={() => setWeekStart(getMonday(new Date()))}
                className="ml-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-bold text-[var(--color-primary)] bg-transparent border border-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] transition-all"
              >
                Today
              </button>
            </div>

            {/* Bulk delete */}
            {selectedSlotIds.size > 0 && (
              <button
                onClick={async () => {
                  const count = selectedSlotIds.size;
                  if (!confirm(`Delete ${count} selected slot(s)? This will also cancel any associated bookings.`)) return;
                  try {
                    await api.post('/slots/bulk-delete', { ids: Array.from(selectedSlotIds) });
                    setSelectedSlotIds(new Set());
                    flash(`${count} slot(s) deleted.`);
                    fetchStadiumAndSlots();
                  } catch (err) {
                    alert(getApiError(err, 'Failed to delete slots.'));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-white bg-[var(--color-danger)] border border-[var(--color-danger)] transition-all hover:bg-[#dc2626] hover:shadow-[0_3px_8px_rgba(220,38,38,0.25)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete ({selectedSlotIds.size})
              </button>
            )}

            {/* Delete All */}
            {!loading && slots.length > 0 && (
              <button
                onClick={async () => {
                  if (!confirm('Delete ALL slots for this stadium? This will also cancel any associated bookings and payments. This action cannot be undone.')) return;
                  if (!confirm('Are you absolutely sure? This will permanently remove all time slots.')) return;
                  try {
                    await api.delete(`/slots/all/${stadiumId}`);
                    setSelectedSlotIds(new Set());
                    flash('All slots deleted.');
                    fetchStadiumAndSlots();
                  } catch (err) {
                    alert(getApiError(err, 'Failed to delete all slots.'));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[0.8125rem] font-bold text-[var(--color-danger)] bg-transparent border border-[var(--color-danger)] transition-all hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete All
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <div className="inline-block w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              <span className="text-[var(--color-text-muted)] text-sm">Loading schedule…</span>
            </div>
          )}

          {!loading && filteredSlots.length === 0 && (
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-14 shadow-sm text-center">
              <div className="text-5xl opacity-50 mb-4">🕐</div>
              {slots.length === 0 ? (
                <>
                  <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No slots yet</p>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">Use the form on the left to generate your first time slots.</p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-[var(--color-text-base)] mb-2">No slots in this week</p>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">Try a different week or location.</p>
                </>
              )}
            </div>
          )}

          {!loading && weekSlots.length > 0 && (() => {
            const gridSlots = weekSlots.map(s => {
                const start = new Date(s.startTime);
                const end = new Date(s.endTime);
                const dayCol = (start.getUTCDay() + 6) % 7 + 2;
                const durHours = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
                const halfHourIndex = (start.getUTCHours() - MIN_HOUR) * 2 + (start.getUTCMinutes() >= 30 ? 1 : 0);
                const gridStartRow = halfHourIndex + 2;
                return { ...s, _dayCol: dayCol, _startRow: gridStartRow, _rowSpan: Math.max(1, Math.round(durHours * 2)) };
              });

            return (
              <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <div
                    className="grid min-w-[700px]"
                    style={{
                      gridTemplateColumns: `56px repeat(7, 1fr)`,
                      gridTemplateRows: `40px repeat(${HALF_HOUR_COUNT}, 24px)`,
                    }}
                  >
                    {/* Corner */}
                    <div className="sticky top-0 z-10 bg-[var(--color-surface-card)] border-b border-r border-[var(--color-border)] flex items-center justify-center"
                         style={{ gridColumn: 1, gridRow: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>

                    {/* Day headers */}
                    {weekDays.map((d, i) => (
                      <div
                        key={i}
                        className="sticky top-0 z-10 bg-[var(--color-surface-card)] border-b border-r border-[var(--color-border)] flex flex-col items-center justify-center px-2 py-1.5"
                        style={{ gridColumn: i + 2, gridRow: 1 }}
                      >
                        <span className="text-[0.6875rem] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-[0.8125rem] font-black ${d.toDateString() === new Date().toDateString() ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-base)]'}`}>
                          {d.getDate()}
                        </span>
                      </div>
                    ))}

                    {/* Half-hour rows */}
                    {halfHourSlots.map((hh, hi) => {
                      const row = hi + 2;
                      return (
                        <Fragment key={hi}>
                          {hh.isHour ? (
                            <div className="border-b border-r border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 flex items-center justify-center text-[0.6875rem] font-bold text-[var(--color-text-muted)]"
                                 style={{ gridColumn: 1, gridRow: `${row} / span 2` }}>
                              {hh.label}
                            </div>
                          ) : (
                            <div className="border-b border-r border-[var(--color-border)]"
                                 style={{ gridColumn: 1, gridRow: row }} />
                          )}
                          {weekDays.map((_, di) => {
                            const cellDate = new Date(weekStart);
                            cellDate.setDate(weekStart.getDate() + di);
                            cellDate.setHours(hh.hour, hh.minutes, 0, 0);
                            const isPast = cellDate < new Date();
                            return (
                              <div
                                key={di}
                                onClick={() => {
                                  const endDate = new Date(cellDate);
                                  endDate.setMinutes(cellDate.getMinutes() + 60);
                                  setSingle({
                                    location: locationFilter !== 'all' ? locationFilter : (stadiumLocations[0] || ''),
                                    startTime: toLocalDatetime(cellDate),
                                    endTime: toLocalDatetime(endDate),
                                    price: '',
                                  });
                                  setTab('single');
                                }}
                                className={`border-b border-r border-[var(--color-border)] relative cursor-pointer transition-colors hover:bg-[var(--color-primary-bg)] ${isPast ? 'bg-[var(--color-surface-muted)]/30' : ''}`}
                                style={{ gridColumn: di + 2, gridRow: row }}
                              />
                            );
                          })}
                        </Fragment>
                      );
                    })}

                    {/* Slot overlays */}
                    {gridSlots.map(slot => {
                      const isBooked = slot.isBooked;
                      return (
                        <div
                          key={slot.id}
                          className="relative group cursor-pointer"
                          style={{
                            gridColumn: `${slot._dayCol}`,
                            gridRow: `${slot._startRow} / span ${slot._rowSpan}`,
                            margin: '1px',
                          }}
                          onClick={() => { if (!isBooked) setEditingSlot(slot); }}
                        >
                          <div className={`h-full rounded-md p-1 flex flex-col justify-between transition-all group-hover:shadow-md ${isBooked ? 'bg-[#fef2f2] border border-[#fecaca] text-[#dc2626]' : 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a]'}`}>
                            <div className="flex items-center justify-between gap-0.5">
                              <span className={`text-[0.6875rem] font-bold leading-tight truncate ${isBooked ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
                                {fmt(slot.startTime)} – {fmt(slot.endTime)}
                              </span>
                              {isBooked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              )}
                            </div>
                            {slot._rowSpan >= 2 && (
                              <div className="flex items-center justify-between gap-0.5">
                                <span className={`text-[0.625rem] font-extrabold ${isBooked ? 'text-[#fca5a5]' : 'text-[#86efac]'}`}>
                                  {slot.price.toLocaleString()} ETB
                                </span>
                                {!isBooked && (
                                  <button
                                    onClick={e => { e.stopPropagation(); setEditingSlot(slot); }}
                                    className="w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
                                    title="Edit"
                                  >
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                            {slot._rowSpan === 1 && (
                              <span className={`text-[0.625rem] font-extrabold ${isBooked ? 'text-[#fca5a5]' : 'text-[#86efac]'}`}>
                                {slot.price.toLocaleString()} ETB
                              </span>
                            )}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(slot.id, isBooked); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-[var(--color-border)] shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca] z-20"
                            title="Delete"
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {editingSlot && (
        <EditSlotModal
          slot={editingSlot}
          stadiumLocations={stadiumLocations}
          onClose={() => setEditingSlot(null)}
          onSuccess={() => {
            setEditingSlot(null);
            flash('Slot updated.');
            fetchStadiumAndSlots();
          }}
        />
      )}
    </div>
  );
}
