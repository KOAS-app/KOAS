import express from 'express';
import {
  createBooking,
  getMyBookings,
  getStadiumBookings,
  cancelBooking,
  confirmBooking,
  ownerCancelBooking,
} from '../controllers/booking.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('PLAYER'), createBooking);
router.get('/my', authenticate, authorizeRoles('PLAYER'), getMyBookings);
router.get('/stadium/:stadiumId', authenticate, authorizeRoles('OWNER'), getStadiumBookings);
router.patch('/:id/cancel', authenticate, authorizeRoles('PLAYER'), cancelBooking);
router.patch('/:id/confirm', authenticate, authorizeRoles('OWNER'), confirmBooking);
router.patch('/:id/owner-cancel', authenticate, authorizeRoles('OWNER'), ownerCancelBooking);

export default router;
