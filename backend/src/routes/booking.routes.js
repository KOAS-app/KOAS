import express from 'express';
import {
  createBooking,
  getMyBookings,
  getStadiumBookings,
  getOwnerBookings,
  getOwnerStats,
  getOwnerInsights,
  getOwnerRecentActivity,
  cancelBooking,
  confirmBooking,
  ownerCancelBooking,
  verifyBookingCode,
} from '../controllers/booking.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema } from '../validators/booking.validators.js';

const router = express.Router();

router.post('/',                     authenticate, authorizeRoles('PLAYER'), validate(createBookingSchema), createBooking);
router.get('/my',                    authenticate, authorizeRoles('PLAYER'), getMyBookings);
router.get('/stadium/:id',           authenticate, authorizeRoles('OWNER'),  getStadiumBookings);
router.get('/verify/:code',          authenticate, authorizeRoles('OWNER'),  verifyBookingCode);

// Owner dashboard routes
router.get('/owner/all',             authenticate, authorizeRoles('OWNER'),  getOwnerBookings);
router.get('/owner/stats',           authenticate, authorizeRoles('OWNER'),  getOwnerStats);
router.get('/owner/insights',        authenticate, authorizeRoles('OWNER'),  getOwnerInsights);
router.get('/owner/recent',          authenticate, authorizeRoles('OWNER'),  getOwnerRecentActivity);

router.patch('/:id/cancel',          authenticate, authorizeRoles('PLAYER'), cancelBooking);
router.patch('/:id/confirm',         authenticate, authorizeRoles('OWNER'),  confirmBooking);
router.patch('/:id/owner-cancel',    authenticate, authorizeRoles('OWNER'),  ownerCancelBooking);

export default router;
