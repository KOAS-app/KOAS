import prisma from '../config/prisma.js';

// POST /api/bookings — player books a slot
export const createBooking = async (req, res) => {
  try {
    const { slotId } = req.body;

    // Use a transaction to prevent race conditions —
    // check + update happen atomically
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: slotId } });

      if (!slot) throw Object.assign(new Error('Slot not found'), { status: 404 });
      if (slot.isBooked) throw Object.assign(new Error('Slot already booked'), { status: 400 });

      await tx.slot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      const newBooking = await tx.booking.create({
        data: {
          playerId: req.user.id,
          stadiumId: slot.stadiumId,
          slotId,
        },
        include: { slot: true, stadium: true },
      });

      // Create a pending cash payment placeholder
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: slot.price,
          method: 'CASH',
          status: 'PENDING',
        },
      });

      return newBooking;
    });

    res.status(201).json(booking);
  } catch (err) {
    const status = err.status ?? 500;
    res.status(status).json({ message: err.message });
  }
};

// GET /api/bookings/my — player sees their bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { playerId: req.user.id },
      include: { slot: true, stadium: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/stadium/:stadiumId — owner sees bookings for their stadium
export const getStadiumBookings = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { id: req.params.stadiumId },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const bookings = await prisma.booking.findMany({
      where: { stadiumId: req.params.stadiumId },
      include: {
        slot: true,
        player: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel — player cancels their booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.playerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });

      return tx.booking.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' },
      });
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/confirm — owner confirms a booking
export const confirmBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { stadium: true },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: `Booking is already ${booking.status.toLowerCase()}` });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMED' },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/owner-cancel — owner cancels a booking
export const ownerCancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { stadium: true },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
      return tx.booking.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' },
      });
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
