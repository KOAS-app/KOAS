import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';

// ─── Shared file filter ────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Extract extension from originalname
  const fileExt = file.originalname.split('.').pop()?.toLowerCase() || '';
  const extname = allowedTypes.test(fileExt);
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

// ─── Multer memory storage (for Cloudinary upload) ────────────────────────────
// Store files in memory instead of disk, then upload to Cloudinary
const memoryStorage = multer.memoryStorage();

// ─── Multer instances ──────────────────────────────────────────────────────────
export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadReceipt = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for receipts
  fileFilter: imageFileFilter,
});

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/upload/stadium-image
export const uploadStadiumImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request. Body:', req.body);
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'koas/stadiums');
    
    console.log('Stadium image uploaded to Cloudinary:', result.secure_url);
    
    res.json({ 
      message: 'Image uploaded successfully', 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (err) {
    console.error('Stadium image upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/upload/stadium-image/:publicId
export const deleteStadiumImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      console.log('Stadium image deleted from Cloudinary:', publicId);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
    console.error('Delete stadium image error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/upload/receipt
export const uploadReceiptImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in receipt upload. Body:', req.body, 'Headers:', req.headers['content-type']);
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'koas/receipts');
    
    console.log('Receipt uploaded to Cloudinary:', result.secure_url);
    
    res.json({ 
      message: 'Receipt uploaded successfully', 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (err) {
    console.error('Receipt upload error:', err);
    res.status(500).json({ message: err.message });
  }
};
