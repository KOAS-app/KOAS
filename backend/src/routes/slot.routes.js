import express from 'express';
import {
  createSlot,
  bulkCreateSlots,
  getSlotsByStadium,
  deleteSlot,
} from '../controllers/slot.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createSlotSchema, bulkSlotSchema } from '../validators/slot.validators.js';

const router = express.Router();

// Players and owners can view slots
router.get('/:stadiumId', authenticate, getSlotsByStadium);

// Only owners can create/delete slots
router.post('/', authenticate, authorizeRoles('OWNER'), validate(createSlotSchema), createSlot);
router.post('/bulk', authenticate, authorizeRoles('OWNER'), validate(bulkSlotSchema), bulkCreateSlots);
router.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteSlot);

export default router;
