import { z } from 'zod';

export const registerSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:       z.string().email('Invalid email address'),
  password:    z.string().min(6, 'Password must be at least 6 characters').max(100),
  role:        z.enum(['PLAYER', 'OWNER'], { message: 'Role must be PLAYER or OWNER' }),
  phoneNumber: z.string()
    .regex(/^\+251[79]\d{8}$/, 'Phone number must be in Ethiopian format: +251XXXXXXXXX')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(6, 'New password must be at least 6 characters').max(100),
});
