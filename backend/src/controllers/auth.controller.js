    import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, subscriptionPlan } = req.body;

    // ADMIN role cannot be self-registered
    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via registration.' });
    }

    // Phone number is required for all roles
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Only check for duplicate email if one was provided
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    const hashedPassword = await hashPassword(password);

    if (role === 'OWNER') {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phoneNumber: phoneNumber || null,
          isApproved: false, // Pending admin approval
          subscriptionPlan: subscriptionPlan ? subscriptionPlan.toUpperCase() : 'STARTER',
        },
      });

      return res.status(201).json({
        message: 'Registration successful. Your account is pending admin approval. You can add your stadium details in the dashboard.',
        user,
      });
    } else {
      // PLAYER
      const userData = { name, password: hashedPassword, role, phoneNumber: phoneNumber || null, isApproved: true };
      if (email) userData.email = email;

      const user = await prisma.user.create({ data: userData });

      const token = generateToken(user, req);
      return res.status(201).json({ user, token });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'OWNER' && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user, req);

    res.status(200).json({
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'OWNER') {
      return res.status(400).json({ message: 'Owners must contact support to delete their accounts.' });
    }

    if (user.role === 'PLAYER') {
      const bookings = await prisma.booking.findMany({ where: { playerId: userId } });

      await prisma.$transaction(async (tx) => {
        // 1. Free up all slots associated with this player's bookings
        for (const booking of bookings) {
          await tx.slot.update({
            where: { id: booking.slotId },
            data: { isBooked: false },
          });
        }
        
        // 2. Delete all payments associated with these bookings
        if (bookings.length > 0) {
          await tx.payment.deleteMany({
            where: { bookingId: { in: bookings.map(b => b.id) } }
          });
        }

        // 3. Delete all bookings by this player
        await tx.booking.deleteMany({
          where: { playerId: userId }
        });

        // 4. Delete the user (reviews are cascaded automatically)
        await tx.user.delete({
          where: { id: userId }
        });
      });
      
      return res.status(200).json({ message: 'Account deleted successfully.' });
    }

    return res.status(400).json({ message: 'Cannot delete account for this role.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};