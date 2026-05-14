import express from 'express';
import {
  createOrUpdateReview,
  getStadiumReviews,
  getMyReview,
  deleteReview,
  getPlayerReviews,
  replyToReview,
  deleteReply,
} from '../controllers/review.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createReviewSchema, replyToReviewSchema } from '../validators/review.validators.js';

const router = express.Router();

// Public routes
router.get('/stadium/:stadiumId', getStadiumReviews);

// Player routes
router.post('/', authenticate, authorizeRoles('PLAYER'), validate(createReviewSchema), createOrUpdateReview);
router.get('/my-review/:stadiumId', authenticate, authorizeRoles('PLAYER'), getMyReview);
router.delete('/:id', authenticate, authorizeRoles('PLAYER'), deleteReview);
router.get('/player/:playerId', getPlayerReviews);

// Owner routes
router.post('/:id/reply', authenticate, authorizeRoles('OWNER'), validate(replyToReviewSchema), replyToReview);
router.delete('/:id/reply', authenticate, authorizeRoles('OWNER'), deleteReply);

export default router;
