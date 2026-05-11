import express from 'express';
import {
  createSlot,
  bulkCreateSlots,
  getSlotsByStadium,
  deleteSlot,
} from '../controllers/slot.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:stadiumId', authenticate, authorizeRoles('OWNER'), getSlotsByStadium);
router.post('/', authenticate, authorizeRoles('OWNER'), createSlot);
router.post('/bulk', authenticate, authorizeRoles('OWNER'), bulkCreateSlots);
router.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteSlot);

export default router;
