import { z } from 'zod';

export const createSlotSchema = z.object({
  stadiumId: z.string().uuid('Invalid stadium ID'),
  location:  z.string().min(1, 'Location is required'),
  startTime: z.coerce.date({ errorMap: () => ({ message: 'Invalid start time' }) }),
  endTime:   z.coerce.date({ errorMap: () => ({ message: 'Invalid end time' }) }),
  price:     z.coerce.number().positive('Price must be a positive number'),
}).refine((d) => d.endTime > d.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const bulkSlotSchema = z.object({
  stadiumId:  z.string().uuid('Invalid stadium ID'),
  location:   z.string().min(1, 'Location is required'),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  openHour:   z.coerce.number().int().min(0).max(23),
  closeHour:  z.coerce.number().int().min(1).max(24),
  duration:   z.coerce.number().positive().max(24, 'Duration cannot exceed 24 hours').optional().default(1),
  price:      z.coerce.number().positive('Price must be a positive number'),
}).refine((d) => d.closeHour > d.openHour, {
  message: 'closeHour must be after openHour',
  path: ['closeHour'],
});
