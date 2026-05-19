import prisma from '../config/prisma.js';

// GET /api/admin/users — list all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, createdAt: true },
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
        data: { isApproved: true },
      });
      // Cascade to their stadiums
      if (u.role === 'OWNER') {
        await tx.stadium.updateMany({
          where: { ownerId: u.id },
          data: { isApproved: true },
        });
      }
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
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: req.params.id },
        data: { isApproved: false },
      });
      // Cascade to their stadiums
      if (u.role === 'OWNER') {
        await tx.stadium.updateMany({
          where: { ownerId: u.id },
          data: { isApproved: false },
        });
      }
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
      include: { owner: { select: { id: true, name: true, email: true, phoneNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/stadiums/:id/approve — approve a stadium
export const approveStadium = async (req, res) => {
  try {
    const stadium = await prisma.stadium.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });

    res.json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/stadiums/:id/reject — reject (unapprove) a stadium
export const rejectStadium = async (req, res) => {
  try {
    const stadium = await prisma.stadium.update({
      where: { id: req.params.id },
      data: { isApproved: false },
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

// GET /api/admin/disputes — list all disputed payments
export const getAllDisputes = async (req, res) => {
  try {
    const disputes = await prisma.payment.findMany({
      where: { isDisputed: true },
      include: {
        booking: {
          include: {
            player: { select: { id: true, name: true, email: true, phoneNumber: true } },
            stadium: { select: { id: true, name: true, owner: { select: { id: true, name: true, email: true } } } },
            slot: true,
          },
        },
      },
      orderBy: { disputedAt: 'desc' },
    });

    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/disputes/:paymentId/resolve-for-player — admin rules in player's favour
export const resolveForPlayer = async (req, res) => {
  try {
    const { resolution } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.paymentId },
      data: {
        status: 'PAID',
        isDisputed: false,
      },
    });

    res.json({ payment, resolution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/disputes/:paymentId/resolve-for-owner — admin rules in owner's favour
export const resolveForOwner = async (req, res) => {
  try {
    const { resolution } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.paymentId },
      data: {
        status: 'REJECTED',
        isDisputed: false,
      },
    });

    res.json({ payment, resolution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
