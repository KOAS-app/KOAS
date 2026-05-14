import { z } from 'zod';

export const createReviewSchema = z.object({
  stadiumId: z.string().uuid('Invalid stadium ID'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be 500 characters or less').optional(),
});

export const replyToReviewSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty').max(500, 'Reply must be 500 characters or less'),
});
