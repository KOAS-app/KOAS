import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address').optional().nullable(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['PLAYER', 'OWNER'], { message: 'Role must be PLAYER or OWNER' }),
  phoneNumber: z.string()
    .regex(/^\+251[79]\d{8}$/, 'Phone number must be in Ethiopian format: +251XXXXXXXXX'),
}).refine(data => data.role !== 'OWNER' || !!data.email, {
  message: 'Email is required for owner accounts',
  path: ['email'],
});

export const loginSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[79]\d{8}$/, 'Phone number must be in Ethiopian format: +251XXXXXXXXX'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
