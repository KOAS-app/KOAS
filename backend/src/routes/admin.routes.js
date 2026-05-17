import express from 'express';
import {
  getAllUsers,
  deleteUser,
  getAllStadiums,
  approveStadium,
  rejectStadium,
  getAllBookings,
  getAllDisputes,
  resolveForPlayer,
  resolveForOwner,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/stadiums', getAllStadiums);
router.patch('/stadiums/:id/approve', approveStadium);
router.patch('/stadiums/:id/reject', rejectStadium);

router.get('/bookings', getAllBookings);

// Dispute resolution
router.get('/disputes', getAllDisputes);
router.patch('/disputes/:paymentId/resolve-for-player', resolveForPlayer);
router.patch('/disputes/:paymentId/resolve-for-owner',  resolveForOwner);

export default router;
