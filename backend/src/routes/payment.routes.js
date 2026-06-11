import express from 'express';
import {
  getPaymentByBooking,
  submitReceipt,
  confirmPayment,
  rejectPayment,

} from '../controllers/payment.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/booking/:bookingId', authenticate, getPaymentByBooking);

// Player submits receipt
router.patch('/:id/submit-receipt', authenticate, authorizeRoles('PLAYER'), submitReceipt);

// Owner confirms or rejects receipt
router.patch('/:id/confirm',  authenticate, authorizeRoles('OWNER'), confirmPayment);
router.patch('/:id/reject',   authenticate, authorizeRoles('OWNER'), rejectPayment);

export default router;
