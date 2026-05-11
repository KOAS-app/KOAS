import express from 'express';
import { getPaymentByBooking, markAsPaid } from '../controllers/payment.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/booking/:bookingId', authenticate, getPaymentByBooking);
router.patch('/:id/mark-paid', authenticate, authorizeRoles('OWNER'), markAsPaid);

export default router;
