import { z } from 'zod';

const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
const daysEnum = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  price: z.number().positive('Price must be a positive number'),
  duration: z.number().int().positive('Duration must be a positive number of days'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isActive: z.boolean().optional().default(true),
  openingTime: z.string().regex(timeRegex, 'Invalid opening time format (e.g., 08:00 AM)').default('08:00 AM'),
  closingTime: z.string().regex(timeRegex, 'Invalid closing time format (e.g., 10:00 PM)').default('10:00 PM'),
  openingDay: daysEnum.default('Monday'),
  closingDay: daysEnum.default('Sunday'),
  weeklyAllowedDays: z.number().int().min(1, 'At least 1 day per week must be allowed').max(7, 'At most 7 days per week').default(1),
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  duration: z.number().int().positive('Duration must be a positive number of days').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
  isActive: z.boolean().optional(),
  openingTime: z.string().regex(timeRegex, 'Invalid opening time format (e.g., 08:00 AM)').optional(),
  closingTime: z.string().regex(timeRegex, 'Invalid closing time format (e.g., 10:00 PM)').optional(),
  openingDay: daysEnum.optional(),
  closingDay: daysEnum.optional(),
  weeklyAllowedDays: z.number().int().min(1).max(7).optional(),
});
