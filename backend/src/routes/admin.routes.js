import express from 'express';
import {
  getAllUsers,
  deleteUser,
  getAllStadiums,
  approveUser,
  rejectUser,
  blockStadium,
  unblockStadium,
  getAllBookings,

  updateUserPlan,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.patch('/users/:id/subscription', updateUserPlan);

router.get('/stadiums', getAllStadiums);
router.patch('/stadiums/:id/block', blockStadium);
router.patch('/stadiums/:id/unblock', unblockStadium);

router.get('/bookings', getAllBookings);

export default router;
