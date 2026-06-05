import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload, uploadLocationImageMulter, uploadReceipt, uploadStadiumImage, deleteStadiumImage, uploadLocationImage, deleteLocationImage, uploadReceiptImage } from '../controllers/upload.controller.js';

const router = Router();

// Upload stadium image (owner only)
router.post('/stadium-image', authenticate, authorizeRoles('OWNER'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error (stadium):', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadStadiumImage);

// Delete stadium image (owner only)
router.delete('/stadium-image/:filename', authenticate, authorizeRoles('OWNER'), deleteStadiumImage);

// Upload location image (owner only)
router.post('/location-image', authenticate, authorizeRoles('OWNER'), (req, res, next) => {
  uploadLocationImageMulter.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error (location):', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadLocationImage);

// Delete location image (owner only)
router.delete('/location-image/:filename', authenticate, authorizeRoles('OWNER'), deleteLocationImage);

// Upload payment receipt (player only)
router.post('/receipt', authenticate, authorizeRoles('PLAYER'), (req, res, next) => {
  uploadReceipt.single('receipt')(req, res, (err) => {
    if (err) {
      console.error('Multer error (receipt):', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadReceiptImage);

export default router;
