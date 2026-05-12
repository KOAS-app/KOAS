import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Slot } from '../types';
import { getApiError } from '../utils/apiError';

type Tab = 'bulk' | 'single';

interface BulkForm  { date: string; openHour: string; closeHour: string; price: string; }
interface SingleForm { startTime: string; endTime: string; price: string; }

const fmt     = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

export default function SlotsPage() {
  const { id: stadiumId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [slots, setSlots]         = useState<Slot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tab, setTab]             = useState<Tab>('bulk');
  const [saving, setSaving]       = useState(false);

  const [single, setSingle] = useState<SingleForm>({ startTime: '', endTime: '', price: '' });
  const [bulk, setBulk]     = useState<BulkForm>({
    date: new Date().toISOString().slice(0, 10),
    openHour: '8', closeHour: '22', price: '',
  });

  const fetchSlots = async () => {
    try {
      const res = await api.get(`/slots/${stadiumId}`);
      setSlots(res.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to load slots.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, [stadiumId]);

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await api.post('/slots/bulk', {
        stadiumId, date: bulk.date,
        openHour: parseInt(bulk.openHour), closeHour: parseInt(bulk.closeHour), price: bulk.price,
      });
      flash(`${res.data.created} slot(s) generated.`);
      fetchSlots();
    } catch (err) { setError(getApiError(err, 'Failed to generate slots.')); }
    finally { setSaving(false); }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/slots', { stadiumId, ...single });
      setSingle({ startTime: '', endTime: '', price: '' });
      flash('Slot created.');
      fetchSlots();
    } catch (err) { setError(getApiError(err, 'Failed to create slot.')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return;
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

      <div className="grid grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left: Form panel */}
        <div className="sticky top-20 flex flex-col gap-4">
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] p-6 shadow-sm">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-[var(--color-surface-muted)] rounded-[10px] mb-6 border border-[var(--color-border)]">
              {(['bulk', 'single'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-1.5 rounded-lg border-none cursor-pointer text-[0.8125rem] font-semibold transition-all ${
                    tab === t
                      ? 'bg-[var(--color-surface-card)] text-[var(--color-primary)] shadow-[var(--shadow-xs)]'
                      : 'bg-transparent text-[var(--color-text-muted)]'
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
              <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Open (0–23)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      min={0} max={23}
                      value={bulk.openHour}
                      onChange={e => setBulk(p => ({ ...p, openHour: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Close (1–24)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                      min={1} max={24}
                      value={bulk.closeHour}
                      onChange={e => setBulk(p => ({ ...p, closeHour: e.target.value }))}
                      required
                    />
                  </div>
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
            )}

            {/* Single form */}
            {tab === 'single' && (
              <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={single.startTime}
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
              Use <strong>Bulk Generate</strong> to create hourly slots for a full day at once. Delete individual slots if needed.
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
              <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm overflow-hidden">
                {daySlots.map((slot, i) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between px-5 py-3.5 transition-all ${
                      i < daySlots.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                    } ${slot.isBooked ? 'bg-[var(--color-surface-muted)] opacity-70' : 'bg-transparent'}`}
                  >
                    {/* Status dot + time */}
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        slot.isBooked 
                          ? 'bg-[var(--color-danger)]' 
                          : 'bg-[var(--color-success)] shadow-[0_0_5px_var(--color-success)]'
                      }`} />
                      <div>
                        <span className="text-[0.9375rem] font-semibold text-[var(--color-text-base)]">
                          {fmt(slot.startTime)} – {fmt(slot.endTime)}
                        </span>
                        <span className="ml-2.5 text-xs text-[var(--color-text-muted)] font-medium">
                          {slot.isBooked ? 'Reserved' : 'Available'}
                        </span>
                      </div>
                    </div>

                    {/* Price + delete */}
                    <div className="flex items-center gap-4">
                      <span className="text-[0.9375rem] font-bold text-[var(--color-primary)] tracking-tight">
                        {slot.price.toLocaleString()} <span className="text-xs font-medium text-[var(--color-text-muted)]">ETB</span>
                      </span>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          title="Delete slot"
                          className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-transparent flex items-center justify-center text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
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
