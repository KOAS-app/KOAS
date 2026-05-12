import { z } from 'zod';

export const createStadiumSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(100),
  location:    z.string().min(2, 'Location is required').max(200),
  description: z.string().max(500).optional(),
});

// Only allow safe fields to be updated — never ownerId, isApproved, createdAt
export const updateStadiumSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  location:    z.string().min(2).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
});
