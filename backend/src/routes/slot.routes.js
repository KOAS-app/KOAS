import express from 'express';
import {
  createSlot,
  bulkCreateSlots,
  generateSlotsFromPlan,
  getSlotsByStadium,
  updateSlot,
  bulkDeleteSlots,
  deleteAllSlots,
  deleteSlot,
} from '../controllers/slot.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createSlotSchema, bulkSlotSchema, updateSlotSchema, bulkDeleteSlotsSchema } from '../validators/slot.validators.js';

const router = express.Router();

// Players and owners can view slots
router.get('/:stadiumId', authenticate, getSlotsByStadium);

// Only owners can create/delete slots
router.post('/', authenticate, authorizeRoles('OWNER'), validate(createSlotSchema), createSlot);
router.post('/bulk', authenticate, authorizeRoles('OWNER'), validate(bulkSlotSchema), bulkCreateSlots);
router.post('/bulk-delete', authenticate, authorizeRoles('OWNER'), validate(bulkDeleteSlotsSchema), bulkDeleteSlots);
router.post('/generate-from-plan', authenticate, authorizeRoles('OWNER'), generateSlotsFromPlan);
router.put('/:id', authenticate, authorizeRoles('OWNER'), validate(updateSlotSchema), updateSlot);
router.delete('/all/:stadiumId', authenticate, authorizeRoles('OWNER'), deleteAllSlots);
router.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteSlot);

export default router;
