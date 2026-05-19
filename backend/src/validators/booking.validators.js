import { z } from 'zod';

export const createBookingSchema = z.object({
  slotId: z.string().uuid('Invalid slot ID').optional(),
  slotIds: z.array(z.string().uuid('Invalid slot ID')).optional(),
}).refine(data => data.slotId || (data.slotIds && data.slotIds.length > 0), {
  message: "Either slotId or slotIds must be provided",
  path: ["slotId"],
});
