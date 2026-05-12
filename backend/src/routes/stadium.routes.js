import express from 'express';
import {
  createStadium,
  getStadiums,
  getStadiumById,
  updateStadium,
  deleteStadium,
  getMyStadiums,
} from '../controllers/stadium.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createStadiumSchema, updateStadiumSchema } from '../validators/stadium.validators.js';

const router = express.Router();

router.get('/',    getStadiums);                                                                          // public
router.get('/my',  authenticate, authorizeRoles('OWNER'), getMyStadiums);                                // owner
router.get('/:id', getStadiumById);                                                                      // public
router.post('/',   authenticate, authorizeRoles('OWNER'), validate(createStadiumSchema), createStadium); // owner
router.put('/:id', authenticate, authorizeRoles('OWNER'), validate(updateStadiumSchema), updateStadium); // owner
router.delete('/:id', authenticate, authorizeRoles('OWNER', 'ADMIN'), deleteStadium);                   // owner or admin

export default router;
