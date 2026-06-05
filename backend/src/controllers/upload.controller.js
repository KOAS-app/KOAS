import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Shared file filter ────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

// ─── Stadium image storage ─────────────────────────────────────────────────────
const stadiumStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/stadiums');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `stadium-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ─── Location image storage ────────────────────────────────────────────────────
const locationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/stadiums');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `location-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ─── Receipt image storage ─────────────────────────────────────────────────────
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/receipts');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ─── Multer instances ──────────────────────────────────────────────────────────
export const upload = multer({
  storage: stadiumStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadLocationImageMulter = multer({
  storage: locationStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadReceipt = multer({
  storage: receiptStorage,
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
    const imageUrl = `/uploads/stadiums/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully', imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Stadium image upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/upload/stadium-image/:filename
export const deleteStadiumImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../public/uploads/stadiums', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/upload/location-image
export const uploadLocationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/stadiums/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully', imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Location image upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/upload/location-image/:filename
export const deleteLocationImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../public/uploads/stadiums', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
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
    const imageUrl = `/uploads/receipts/${req.file.filename}`;
    console.log('Receipt uploaded successfully:', imageUrl);
    res.json({ message: 'Receipt uploaded successfully', imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Receipt upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

