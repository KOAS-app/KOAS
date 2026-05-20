import { z } from 'zod';

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  price: z.number().positive('Price must be a positive number'),
  duration: z.number().int().positive('Duration must be a positive number of days'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  duration: z.number().int().positive('Duration must be a positive number of days').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
  isActive: z.boolean().optional(),
});
