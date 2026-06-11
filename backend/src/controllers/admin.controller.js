import prisma from '../config/prisma.js';

// GET /api/admin/users — list all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, isApproved: true, subscriptionPlan: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id — delete a user
export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/approve — approve a user (owner)
export const approveUser = async (req, res) => {
  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: req.params.id },
        data: { 
          isApproved: true,
          rejectionReason: null, // Clear rejection reason on approval
        },
      });
      return u;
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/reject — reject (unapprove) a user (owner)
export const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: req.params.id },
        data: { 
          isApproved: false,
          rejectionReason: reason || null,
        },
      });
      return u;
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stadiums — list all stadiums (approved + pending)
export const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      include: { owner: { select: { id: true, name: true, email: true, phoneNumber: true, subscriptionPlan: true } }, locations: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/stadiums/:id/block — block a stadium
export const blockStadium = async (req, res) => {
  try {
    const { reason } = req.body;
    const stadium = await prisma.stadium.update({
      where: { id: req.params.id },
      data: { isBlocked: true, blockedReason: reason || 'Blocked by admin' },
      include: { owner: { select: { id: true, name: true } } },
    });

    res.json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/stadiums/:id/unblock — unblock a stadium
export const unblockStadium = async (req, res) => {
  try {
    const stadium = await prisma.stadium.update({
      where: { id: req.params.id },
      data: { isBlocked: false, blockedReason: null },
      include: { owner: { select: { id: true, name: true } } },
    });

    res.json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/bookings — monitor all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        player: { select: { id: true, name: true, email: true, phoneNumber: true } },
        stadium: { select: { id: true, name: true } },
        slot: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/subscription — update owner's plan tier
export const updateUserPlan = async (req, res) => {
  try {
    const { subscriptionPlan } = req.body;
    if (!['STARTER', 'PRO', 'ELITE'].includes(subscriptionPlan)) {
      return res.status(400).json({ message: 'Invalid subscription plan tier.' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { subscriptionPlan },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
