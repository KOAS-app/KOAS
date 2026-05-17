import express from 'express';
import { register, login, changePassword, deleteAccount } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validators.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.delete('/delete-account', authenticate, deleteAccount);

export default router;
