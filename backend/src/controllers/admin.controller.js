import prisma from '../config/prisma.js';

// GET /api/admin/users — list all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
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

// GET /api/admin/stadiums — list all stadiums (approved + pending)
export const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
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
        player: { select: { id: true, name: true, email: true } },
        stadium: { select: { id: true, name: true } },
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
