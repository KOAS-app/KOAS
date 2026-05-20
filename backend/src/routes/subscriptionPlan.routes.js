import express from 'express';
import {
  getSubscriptionPlansByStadium,
  getMySubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from '../controllers/subscriptionPlan.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} from '../validators/subscriptionPlan.validators.js';

const router = express.Router();

// Public / Player route: Get all active plans for a specific stadium
router.get('/stadium/:stadiumId', getSubscriptionPlansByStadium);

// Owner-only routes (requires authentication & OWNER role)
router.use(authenticate, authorizeRoles('OWNER'));

router.get('/my', getMySubscriptionPlans);
router.post('/', validate(createSubscriptionPlanSchema), createSubscriptionPlan);
router.put('/:id', validate(updateSubscriptionPlanSchema), updateSubscriptionPlan);
router.delete('/:id', deleteSubscriptionPlan);

export default router;
