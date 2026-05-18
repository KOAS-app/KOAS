import { useState, FormEvent, useEffect } from 'react';
import api from '../api/axios';
import { Stadium } from '../types';
import { getApiError } from '../utils/apiError';

interface Props {
  stadium: Stadium | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function StadiumModal({ stadium, onClose, onSaved }: Props) {
  const isEdit = stadium !== null;
  const [form, setForm] = useState({ 
    name: '', 
    locations: [''], 
    description: '', 
    imageUrl: '', 
    amenities: [] as string[]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common amenities list
  const commonAmenities = [
    'Parking',
    'Changing Rooms',
    'Showers',
    'Floodlights',
    'Seating Area',
    'Refreshments',
    'First Aid',
    'Equipment Rental',
    'WiFi',
    'Security',
  ];

  useEffect(() => {
    if (isEdit) {
      setForm({ 
        name: stadium.name, 
        locations: stadium.locations.length > 0 ? stadium.locations : [''],
        description: stadium.description ?? '',
        imageUrl: stadium.imageUrl ?? '',
        amenities: stadium.amenities ?? []
      });
      if (stadium.imageUrl) {
        setImagePreview(stadium.imageUrl);
      }
    }
  }, [stadium, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLocationChange = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      locations: prev.locations.map((loc, i) => i === index ? value : loc)
    }));
  };

  const addLocation = () => {
    setForm(prev => ({
      ...prev,
      locations: [...prev.locations, '']
    }));
  };

  const removeLocation = (index: number) => {
    if (form.locations.length > 1) {
      setForm(prev => ({
        ...prev,
        locations: prev.locations.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing image, current form.imageUrl:', form.imageUrl);
    setImageFile(null);
    setImagePreview('');
    setForm(prev => {
      const updated = { ...prev, imageUrl: '' };
      console.log('Updated form after removing image:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent double submission
    
    if (loading || uploading) {
      console.log('Already submitting, ignoring...');
      return;
    }
    
    setError('');
    setLoading(true);
    
    console.log('=== SUBMIT STARTED ===');
    console.log('Form state:', form);
    console.log('Image file:', imageFile);
    
    try {
      let finalImageUrl = form.imageUrl; // Start with existing imageUrl
      
      // If there's a new image file, upload it first
      if (imageFile) {
        console.log('New image file detected, uploading...');
        setUploading(true);
        
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          // Don't set Content-Type header - let axios set it with the correct boundary
          const uploadRes = await api.post('/upload/stadium-image', formData);
          
          console.log('Upload response:', uploadRes.data);
          finalImageUrl = uploadRes.data.imageUrl;
          console.log('New imageUrl from upload:', finalImageUrl);
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          throw new Error('Failed to upload image');
        } finally {
          setUploading(false);
        }
      } else {
        console.log('No new image file, using existing imageUrl:', finalImageUrl);
      }
      
      console.log('About to submit with imageUrl:', finalImageUrl);
      
      const submitData = {
        name: form.name,
        locations: form.locations.filter(loc => loc.trim() !== ''), // Remove empty locations
        description: form.description,
        imageUrl: finalImageUrl || undefined,
        amenities: form.amenities
      };

      console.log('Final submit data:', JSON.stringify(submitData, null, 2));

      if (isEdit) {
        console.log('Updating stadium:', stadium.id);
        await api.put(`/stadiums/${stadium.id}`, submitData);
      } else {
        console.log('Creating new stadium');
        await api.post('/stadiums', submitData);
      }
      
      console.log('=== SUBMIT SUCCESSFUL ===');
      onSaved();
    } catch (err) {
      console.error('Submit error:', err);
      setError(getApiError(err, 'Failed to save stadium.'));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="w-full max-w-[480px] max-h-[90vh] bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-base)] tracking-tight">
              {isEdit ? 'Edit Stadium' : 'Add Stadium'}
            </h2>
            <p className="text-[0.8125rem] text-[var(--color-text-muted)] mt-0.5">
              {isEdit ? 'Update your turf profile details.' : 'Fill in the details to register your turf.'}
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

        {/* Body - Scrollable */}
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
                Stadium Image
                <span className="text-[var(--color-text-muted)] font-normal ml-1">(optional)</span>
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-3 rounded-[10px] overflow-hidden border-[1.5px] border-[var(--color-border)]">
                  <img 
                    src={imagePreview.startsWith('http') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePreview}` : imagePreview}
                    alt="Stadium preview" 
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-[rgba(220,38,38,0.8)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="stadium-image-input"
                />
                <label
                  htmlFor="stadium-image-input"
                  className="flex items-center justify-center gap-2 w-full px-3.5 py-3 border-[1.5px] border-dashed border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] text-[0.8125rem] font-medium cursor-pointer transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {imagePreview ? 'Change Image' : 'Upload Stadium Image'}
                </label>
              </div>
              <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-1.5">
                JPG, PNG, GIF or WebP. Max size 5MB.
              </p>
            </div>

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[0.8125rem] font-semibold text-[var(--color-text-secondary)] tracking-tight">
                  Branch Locations
                </label>
                <button
                  type="button"
                  onClick={addLocation}
                  className="text-[0.75rem] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                >
                  + Add Location
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {form.locations.map((location, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3.5 py-2.5 border-[1.5px] border-[var(--color-border)] rounded-[10px] bg-[var(--color-surface-card)] text-[var(--color-text-base)] text-[0.9375rem] outline-none transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] focus:bg-white"
                      placeholder={`Location ${index + 1} (e.g., Bole, Addis Ababa)`}
                      value={location}
                      onChange={(e) => handleLocationChange(index, e.target.value)}
                      required={index === 0}
                    />
                    {form.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] transition-all hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:border-[#fecaca]"
                        title="Remove location"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-1.5">
                Add all your branch locations. At least one location is required.
              </p>
            </div>

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
                    <span className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-1.5">
                Select all amenities available at your stadium.
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
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="inline-block w-3.5 h-3.5 border-[1.5px] border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin" />
                    Uploading…
                  </span>
                ) : loading ? (
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
