import { z } from 'zod';

export const createStadiumSchema = z.object({
  name:              z.string().min(2, 'Name must be at least 2 characters').max(100),
  description:       z.string().max(500).optional(),
  amenities:         z.array(z.string().min(1).max(100)).optional().default([]),
});

// Only allow safe fields to be updated — never ownerId, isApproved, createdAt
export const updateStadiumSchema = z.object({
  name:              z.string().min(2).max(100).optional(),
  description:       z.string().max(500).optional().nullable(),
  amenities:         z.array(z.string().min(1).max(100)).optional(),
});
