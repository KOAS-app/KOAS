import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters').max(200),
  address: z.string().max(500).optional().nullable(),
  images: z.array(z.string()).optional().default([]),
});

export const updateLocationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  address: z.string().max(500).optional().nullable(),
  images: z.array(z.string()).optional(),
});
