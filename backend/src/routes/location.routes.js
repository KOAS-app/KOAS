import express from 'express';
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createLocationSchema, updateLocationSchema } from '../validators/location.validators.js';

const router = express.Router();

router.get('/stadium/:stadiumId', getLocations);                                                              // public
router.get('/:id', getLocationById);                                                                          // public
router.post('/stadium/:stadiumId', authenticate, authorizeRoles('OWNER'), validate(createLocationSchema), createLocation); // owner
router.put('/:id', authenticate, authorizeRoles('OWNER'), validate(updateLocationSchema), updateLocation);    // owner
router.delete('/:id', authenticate, authorizeRoles('OWNER'), deleteLocation);                                // owner

export default router;
