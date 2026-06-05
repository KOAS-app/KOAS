import { useState, FormEvent, useEffect } from 'react';
import api from '../api/axios';
import { Location } from '../types';
import { getApiError } from '../utils/apiError';

interface Props {
  location: Location | null;
  stadiumId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function LocationModal({ location, stadiumId, onClose, onSaved }: Props) {
  const isEdit = location !== null;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isEdit) {
      setName(location.name);
      setAddress(location.address ?? '');
      setImages(location.images ?? []);
    }
  }, [location, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await api.post('/upload/location-image', formData);
      setImages(prev => [...prev, uploadRes.data.imageUrl]);
    } catch (err) {
      setError(getApiError(err, 'Failed to upload image'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    const filename = imageUrl.split('/').pop();
    if (filename) {
      try {
        await api.delete(`/upload/location-image/${filename}`);
      } catch {
        // File may not exist, continue
      }
    }
    setImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || uploading) return;

    setError('');
    setLoading(true);

    try {
      const data = {
        name: name.trim(),
        address: address.trim() || null,
        images,
      };

      if (isEdit) {
        await api.put(`/locations/${location.id}`, data);
      } else {
        await api.post(`/locations/stadium/${stadiumId}`, data);
      }

      onSaved();
    } catch (err) {
      setError(getApiError(err, `Failed to ${isEdit ? 'update' : 'create'} location.`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[520px] max-h-[90vh] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              {isEdit ? 'Edit Location' : 'Add Location'}
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {isEdit ? 'Update this branch location.' : 'Add a new branch location with photos.'}
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
            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Location Name
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                placeholder="e.g. Bole Branch"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Address
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                placeholder="e.g. Bole, Addis Ababa, Ethiopia"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] mb-1.5 tracking-tight">
                Location Photos
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-[10px] overflow-hidden border-[1.5px] border-[var(--color-border)] aspect-[4/3]">
                      <img
                        src={`${apiUrl}${img}`}
                        alt={`Location photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-md bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-[rgba(220,38,38,0.8)]"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="location-image-input"
                  disabled={uploading}
                />
                <label
                  htmlFor="location-image-input"
                  className="flex items-center justify-center gap-2 w-full px-3.5 py-3 border-[1.5px] border-dashed border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] text-[0.8125rem] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                      Uploading…
                    </span>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {images.length > 0 ? 'Add Another Photo' : 'Upload Photo'}
                    </>
                  )}
                </label>
              </div>
              <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-1.5">
                JPG, PNG, GIF or WebP. Max 5MB each. Upload multiple photos of this location.
              </p>
            </div>

            {/* Actions */}
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
                ) : isEdit ? 'Save Changes' : 'Add Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
