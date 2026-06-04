import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload, uploadReceipt, uploadStadiumImage, deleteStadiumImage, uploadReceiptImage } from '../controllers/upload.controller.js';

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
router.delete('/stadium-image/:publicId(*)', authenticate, authorizeRoles('OWNER'), deleteStadiumImage);

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
