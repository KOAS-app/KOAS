import express from 'express';
import { register, login, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/change-password', authenticate, changePassword);

export default router;