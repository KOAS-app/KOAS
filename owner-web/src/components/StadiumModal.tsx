import { useState, FormEvent, useEffect } from 'react';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

interface Props {
  stadium: Stadium | null;
  onClose: () => void;
  onSaved: () => void;
}

interface LocationInput {
  id?: string;
  name: string;
  address: string;
  images: string[];
}

const ADDIS_ABABA_LOCATIONS = [
  'Bole',
  'Yeka',
  'Kirkos',
  'Lideta',
  'Arada',
  'Addis Ketema',
  'Gullele',
  'Kolfe Keranio',
  'Nifas Silk-Lafto',
  'Akaki Kality',
  'Lemi Kura',
  'Mexico',
  'Sarbet',
  'Megenagna',
  'Piazza',
  'Jemma',
  'Haya Hulet',
  'CMC',
  'Summit',
  'Jemo',
  'Gerji'
];

export default function StadiumModal({ stadium, onClose, onSaved }: Props) {
  const isEdit = stadium !== null;

  const [form, setForm] = useState({
    name: '',
    description: '',
    amenities: [] as string[]
  });
  const [locations, setLocations] = useState<LocationInput[]>([]);
  const [deletedLocationIds, setDeletedLocationIds] = useState<string[]>([]);
  const [addingLocation, setAddingLocation] = useState(false);
  const [locationForm, setLocationForm] = useState<LocationInput>({ name: '', address: '', images: [] });
  const [editingLocIdx, setEditingLocIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const commonAmenities = [
    'Parking', 'Changing Rooms', 'Showers', 'Floodlights',
    'Seating Area', 'Refreshments', 'First Aid', 'Equipment Rental', 'WiFi', 'Security',
  ];

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: stadium.name,
        description: stadium.description ?? '',
        amenities: stadium.amenities ?? []
      });
      setLocations(stadium.locations.map(l => ({
        id: l.id,
        name: l.name,
        address: l.address ?? '',
        images: l.images ?? []
      })));
    }
  }, [stadium, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  /* ── Location image upload ─────────────────────────────────── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post('/upload/location-image', formData);
      setLocationForm(prev => ({ ...prev, images: [...prev.images, uploadRes.data.imageUrl] }));
    } catch (err) {
      setError(getApiError(err, 'Failed to upload image'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    const filename = imageUrl.split('/').pop();
    if (filename) {
      try { await api.delete(`/upload/location-image/${filename}`); } catch { }
    }
    setLocationForm(prev => ({ ...prev, images: prev.images.filter(img => img !== imageUrl) }));
  };

  /* ── Location CRUD ─────────────────────────────────────────── */
  const resetLocationForm = () => {
    setLocationForm({ name: '', address: '', images: [] });
    setAddingLocation(false);
    setEditingLocIdx(null);
  };

  const handleAddLocation = () => {
    if (!locationForm.name.trim()) { setError('Location name is required.'); return; }
    const formattedName = locationForm.name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const formattedLocation = { ...locationForm, name: formattedName, address: locationForm.address.trim() };
    if (editingLocIdx !== null) {
      setLocations(prev => prev.map((l, i) => i === editingLocIdx ? formattedLocation : l));
    } else {
      setLocations(prev => [...prev, formattedLocation]);
    }
    resetLocationForm();
  };

  const handleEditLocation = (idx: number) => {
    setLocationForm({ ...locations[idx] });
    setEditingLocIdx(idx);
    setAddingLocation(true);
  };

  const handleDeleteLocation = (idx: number) => {
    if (!confirm('Delete this location?')) return;
    const loc = locations[idx];
    if (loc.id) {
      setDeletedLocationIds(prev => [...prev, loc.id!]);
    }
    setLocations(prev => prev.filter((_, i) => i !== idx));
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || uploading) return;
    if (!form.name.trim()) { setError('Stadium name is required.'); return; }

    setError('');
    setLoading(true);

    try {
      const stadiumData: Record<string, unknown> = {
        name: form.name.trim(),
        amenities: form.amenities,
      };
      if (form.description.trim()) stadiumData.description = form.description.trim();

      if (isEdit) {
        await api.put(`/stadiums/${stadium.id}`, stadiumData);
        // Delete locations that were removed
        for (const locId of deletedLocationIds) {
          try {
            await api.delete(`/locations/${locId}`);
          } catch (err) {
            console.error('Failed to delete location:', locId, err);
          }
        }
        for (const loc of locations) {
          const locData: Record<string, unknown> = { name: loc.name.trim(), images: loc.images };
          if (loc.address.trim()) locData.address = loc.address.trim();
          if (loc.id) {
            await api.put(`/locations/${loc.id}`, locData);
          } else {
            await api.post(`/locations/stadium/${stadium.id}`, locData);
          }
        }
      } else {
        const stadiumRes = await api.post('/stadiums', stadiumData);
        const newStadiumId = stadiumRes.data.id || stadiumRes.data.stadium?.id;
        for (const loc of locations) {
          const locData: Record<string, unknown> = { name: loc.name.trim(), images: loc.images };
          if (loc.address.trim()) locData.address = loc.address.trim();
          await api.post(`/locations/stadium/${newStadiumId}`, locData);
        }
        if (locations.length === 0) {
          await api.post(`/locations/stadium/${newStadiumId}`, {
            name: 'Main Branch',
            images: [],
          });
        }
      }

      onSaved();
    } catch (err) {
      setError(getApiError(err, 'Failed to save stadium.'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[600px] max-h-[90vh] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              {isEdit ? 'Edit Stadium' : 'Add Stadium'}
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {isEdit ? 'Update your turf profile and branch locations.' : 'Fill in the details to register your turf.'}
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

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 mb-4 rounded-lg bg-[var(--color-danger-bg)] border border-[#fecaca] text-[var(--color-danger)] text-[0.8125rem] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ── Stadium Name ──────────────────────────────────── */}
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">Stadium Name</label>
              <input
                name="name" type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="e.g. Green Arena"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* ── Description ───────────────────────────────────── */}
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Description
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>
              <textarea
                name="description"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white disabled:bg-[var(--color-surface-muted)] disabled:opacity-60 disabled:cursor-not-allowed resize-y min-h-[80px]"
                placeholder="Describe your turf — surface, capacity, facilities…"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* ── Amenities ─────────────────────────────────────── */}
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-2 tracking-tight">
                Amenities
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {commonAmenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2.5 px-3 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] cursor-pointer transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)] has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[rgba(22,163,74,0.05)]"
                  >
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 rounded border-[1.5px] border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Branch Locations ──────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] tracking-tight">
                  Branch Locations
                  <span className="text-[var(--color-text-muted)] font-normal ml-1">(required)</span>
                </label>
                {!addingLocation && (
                  <button
                    type="button"
                    onClick={() => { resetLocationForm(); setAddingLocation(true); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-bold text-[var(--color-primary)] bg-transparent border border-[var(--color-primary)] transition-all hover:bg-[rgba(22,163,74,0.08)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {locations.length === 0 ? 'Add Location' : 'Add Another'}
                  </button>
                )}
              </div>

              {/* Existing locations */}
              {locations.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {locations.map((loc, idx) => (
                    <div key={idx} className="flex items-start gap-3 px-3.5 py-3 border border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] font-bold text-[var(--color-text-base)]">{loc.name}</p>
                        {loc.address && <p className="text-[0.75rem] text-[var(--color-text-muted)] truncate">{loc.address}</p>}
                        {loc.images.length > 0 && (
                          <p className="text-[0.6875rem] text-[var(--color-text-muted)] mt-0.5">{loc.images.length} photo{loc.images.length > 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditLocation(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-base)]"
                          title="Edit"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
                          title="Delete"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline add/edit location form */}
              {addingLocation && (
                <div className="border border-[var(--color-border)] rounded-[10px] p-4 bg-[var(--color-surface-muted)] space-y-3 mb-3">
                  <div>
                    <label className="block text-[0.75rem] font-semibold text-[var(--color-text-secondary)] mb-1 tracking-tight">Location Name</label>
                    <select
                      className="w-full px-3 py-2 border-[1.5px] border-[var(--color-border)] rounded-[8px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]"
                      value={locationForm.name}
                      onChange={e => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    >
                      <option value="">-- Select Location --</option>
                      {(() => {
                        const options = [...ADDIS_ABABA_LOCATIONS];
                        if (locationForm.name && !options.includes(locationForm.name)) {
                          options.unshift(locationForm.name);
                        }
                        return options.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-semibold text-[var(--color-text-secondary)] mb-1 tracking-tight">
                      Address
                      <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-[1.5px] border-[var(--color-border)] rounded-[8px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.875rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]"
                      placeholder="e.g. Bole, Addis Ababa"
                      value={locationForm.address}
                      onChange={e => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-semibold text-[var(--color-text-secondary)] mb-1 tracking-tight">
                      Photos
                      <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
                    </label>
                    {locationForm.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {locationForm.images.map((img, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden border border-[var(--color-border)] aspect-square">
                            <img src={`${apiUrl}${img}`} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded bg-[rgba(0,0,0,0.6)] flex items-center justify-center text-white hover:bg-[rgba(220,38,38,0.8)]"
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="modal-loc-img-input" disabled={uploading} />
                      <label
                        htmlFor="modal-loc-img-input"
                        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 border-[1.5px] border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] text-[0.75rem] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        {uploading ? (
                          <span className="flex items-center gap-1.5">
                            <div className="inline-block w-3 h-3 border-[1.5px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                            Uploading…
                          </span>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            {locationForm.images.length > 0 ? 'Add Another Photo' : 'Upload Photo'}
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddLocation}
                      className="flex-1 py-2 rounded-lg text-[0.8125rem] font-bold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!locationForm.name.trim() || uploading}
                    >
                      {editingLocIdx !== null ? 'Update Location' : 'Add Location'}
                    </button>
                    <button
                      type="button"
                      onClick={resetLocationForm}
                      className="px-4 py-2 rounded-lg text-[0.8125rem] font-bold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!addingLocation && locations.length === 0 && (
                <p className="text-[0.75rem] text-[var(--color-text-muted)]">No branch locations added yet.</p>
              )}
            </div>

            {/* ── Actions ───────────────────────────────────────── */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-border)] transition-all hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-base)]"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-[var(--color-primary)] border border-[var(--color-primary)] shadow-[0_1px_2px_rgba(22,163,74,0.2)] transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[0_3px_8px_rgba(22,163,74,0.25)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || uploading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : isEdit ? 'Save Changes' : 'Add Stadium'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
