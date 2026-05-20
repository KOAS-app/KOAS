import express from 'express';
import {
  subscribeToPlan,
  getMySubscriptions,
  getSubscriptionRequests,
  confirmSubscription,
  rejectSubscription,
  verifySubscriptionCode
} from '../controllers/playerSubscription.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// General authentication required for all routes
router.use(authenticate);

// Player specific routes
router.post('/subscribe', authorizeRoles('PLAYER'), subscribeToPlan);
router.get('/my', authorizeRoles('PLAYER'), getMySubscriptions);

// Owner specific routes
router.get('/requests', authorizeRoles('OWNER'), getSubscriptionRequests);
router.get('/verify/:code', authorizeRoles('OWNER', 'ADMIN'), verifySubscriptionCode);
router.patch('/:id/confirm', authorizeRoles('OWNER'), confirmSubscription);
router.patch('/:id/reject', authorizeRoles('OWNER'), rejectSubscription);

export default router;
