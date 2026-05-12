import { z } from 'zod';

export const createSlotSchema = z.object({
  stadiumId: z.string().uuid('Invalid stadium ID'),
  startTime: z.string().datetime({ message: 'Invalid startTime format' }),
  endTime:   z.string().datetime({ message: 'Invalid endTime format' }),
  price:     z.coerce.number().positive('Price must be a positive number'),
}).refine((d) => new Date(d.endTime) > new Date(d.startTime), {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export const bulkSlotSchema = z.object({
  stadiumId:  z.string().uuid('Invalid stadium ID'),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  openHour:   z.coerce.number().int().min(0).max(23),
  closeHour:  z.coerce.number().int().min(1).max(24),
  price:      z.coerce.number().positive('Price must be a positive number'),
}).refine((d) => d.closeHour > d.openHour, {
  message: 'closeHour must be after openHour',
  path: ['closeHour'],
});
