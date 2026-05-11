import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Slot } from '../types';
import { getApiError } from '../utils/apiError';

type Tab = 'single' | 'bulk';

interface BulkForm {
  date: string;
  openHour: string;
  closeHour: string;
  price: string;
}

interface SingleForm {
  startTime: string;
  endTime: string;
  price: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

export default function SlotsPage() {
  const { id: stadiumId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('bulk');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [single, setSingle] = useState<SingleForm>({ startTime: '', endTime: '', price: '' });
  const [bulk, setBulk] = useState<BulkForm>({
    date: new Date().toISOString().slice(0, 10),
    openHour: '8',
    closeHour: '22',
    price: '',
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

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/slots', { stadiumId, ...single });
      setSingle({ startTime: '', endTime: '', price: '' });
      flash('Slot created.');
      fetchSlots();
    } catch (err) {
      setError(getApiError(err, 'Failed to create slot.'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/slots/bulk', {
        stadiumId,
        date: bulk.date,
        openHour: parseInt(bulk.openHour),
        closeHour: parseInt(bulk.closeHour),
        price: bulk.price,
      });
      flash(`${res.data.created} slot(s) generated.`);
      fetchSlots();
    } catch (err) {
      setError(getApiError(err, 'Failed to generate slots.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await api.delete(`/slots/${slotId}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      alert(getApiError(err, 'Failed to delete slot.'));
    }
  };

  // Group slots by date
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.startTime).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/stadiums')}
          className="btn btn-ghost text-sm"
        >
          ← Back
        </button>
        <h1 className="page-title mb-0">Manage Slots</h1>
      </div>

      <div className="flex gap-6 items-start" style={{ flexWrap: 'wrap' }}>

        {/* ── Left: Add slot form ── */}
        <div className="card w-full" style={{ maxWidth: 360 }}>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
            {(['bulk', 'single'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 text-sm py-1.5 rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: tab === t ? 'var(--color-surface-card)' : 'transparent',
                  color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
                }}
              >
                {t === 'bulk' ? '⚡ Bulk Generate' : '➕ Single Slot'}
              </button>
            ))}
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded mb-4"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="text-sm px-3 py-2 rounded mb-4"
              style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Bulk form */}
          {tab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={bulk.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBulk((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Open Hour</label>
                  <input
                    type="number"
                    className="input"
                    min={0} max={23}
                    value={bulk.openHour}
                    onChange={(e) => setBulk((p) => ({ ...p, openHour: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="label">Close Hour</label>
                  <input
                    type="number"
                    className="input"
                    min={1} max={24}
                    value={bulk.closeHour}
                    onChange={(e) => setBulk((p) => ({ ...p, closeHour: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Price per slot (ETB)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 500"
                  min={0}
                  value={bulk.price}
                  onChange={(e) => setBulk((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                {saving ? 'Generating…' : '⚡ Generate Slots'}
              </button>
            </form>
          )}

          {/* Single form */}
          {tab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="label">Start Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={single.startTime}
                  onChange={(e) => setSingle((p) => ({ ...p, startTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">End Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={single.endTime}
                  onChange={(e) => setSingle((p) => ({ ...p, endTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Price (ETB)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 500"
                  min={0}
                  value={single.price}
                  onChange={(e) => setSingle((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                {saving ? 'Saving…' : '➕ Add Slot'}
              </button>
            </form>
          )}
        </div>

        {/* ── Right: Slot list ── */}
        <div className="flex-1" style={{ minWidth: 280 }}>
          {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading slots...</p>}

          {!loading && slots.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-3xl mb-2">🕐</p>
              <p className="font-medium" style={{ color: 'var(--color-text-base)' }}>No slots yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Use the form to generate slots for this stadium
              </p>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([day, daySlots]) => (
            <div key={day} className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--color-text-muted)' }}>
                {fmtDate(daySlots[0].startTime)}
              </p>
              <div className="card p-0 overflow-hidden">
                {daySlots.map((slot, i) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      borderBottom: i < daySlots.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-base)' }}>
                        {fmt(slot.startTime)} – {fmt(slot.endTime)}
                      </span>
                      <span className={`badge ${slot.isBooked ? 'badge-danger' : 'badge-success'}`}>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {slot.price.toLocaleString()} ETB
                      </span>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-xs"
                          style={{ color: 'var(--color-danger)' }}
                          title="Delete slot"
                        >
                          🗑️
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
