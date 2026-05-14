import { z } from 'zod';

export const createStadiumSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(100),
  locations:   z.array(z.string().min(2).max(200)).min(1, 'At least one location is required'),
  description: z.string().max(500).optional(),
  imageUrl:    z.string().optional().or(z.literal('')),
  amenities:   z.array(z.string().min(1).max(100)).optional().default([]),
});

// Only allow safe fields to be updated — never ownerId, isApproved, createdAt
export const updateStadiumSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  locations:   z.array(z.string().min(2).max(200)).min(1).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl:    z.string().optional().nullable(),
  amenities:   z.array(z.string().min(1).max(100)).optional(),
});
