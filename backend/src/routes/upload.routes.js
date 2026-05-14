import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload, uploadStadiumImage, deleteStadiumImage } from '../controllers/upload.controller.js';

const router = Router();

// Upload stadium image (owner only)
router.post('/stadium-image', authenticate, authorizeRoles('OWNER'), upload.single('image'), uploadStadiumImage);

// Delete stadium image (owner only)
router.delete('/stadium-image/:filename', authenticate, authorizeRoles('OWNER'), deleteStadiumImage);

export default router;
