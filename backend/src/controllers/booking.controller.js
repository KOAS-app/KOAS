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
      include: {
        slot: true,
        stadium: {
          select: {
            id: true,
            name: true,
            bankAccounts: {
              where: { isDefault: true },
              select: {
                bankName: true,
                accountNumber: true,
                accountHolderName: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten the default bank account into stadium object for easier access
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      stadium: {
        ...booking.stadium,
        bankName: booking.stadium.bankAccounts[0]?.bankName,
        accountNumber: booking.stadium.bankAccounts[0]?.accountNumber,
        accountHolderName: booking.stadium.bankAccounts[0]?.accountHolderName,
        bankAccounts: undefined, // Remove the nested array
      },
    }));

    res.json(formattedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/stadium/:id — get all bookings for a specific stadium
export const getStadiumBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { stadiumId: id },
      include: {
        slot: true,
        player: { select: { id: true, name: true, email: true, phoneNumber: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner/all — owner sees all bookings (with optional filter/search)
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const stadium = await prisma.stadium.findUnique({ where: { ownerId } });
    if (!stadium) return res.json([]);

    const { status, search, date } = req.query;

    // Calculate 7-day window (3 days before, 3 days after) if date is provided
    let dateFilter = {};
    if (date) {
      const centerDate = new Date(date);
      const startDate = new Date(centerDate);
      startDate.setDate(centerDate.getDate() - 3);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(centerDate);
      endDate.setDate(centerDate.getDate() + 3);
      endDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { gte: startDate, lte: endDate } };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        stadiumId: stadium.id,
        ...dateFilter,
        ...(status && status !== 'all' ? { status: status.toUpperCase() } : {}),
        ...(search ? {
          OR: [
            { player: { name: { contains: search, mode: 'insensitive' } } },
            { player: { email: { contains: search, mode: 'insensitive' } } },
          ]
        } : {}),
      },
      include: {
        slot: true,
        player: { select: { id: true, name: true, email: true, phoneNumber: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner/stats — owner sees booking stats
export const getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { date } = req.query;
    
    const stadium = await prisma.stadium.findUnique({ where: { ownerId } });
    if (!stadium) return res.json({ pending: 0, confirmed: 0, cancelled: 0, paid: 0, revenue: 0 });

    // If date is provided, calculate stats for that week
    let dateFilter = {};
    if (date) {
      const baseDate = new Date(date);
      const startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() - 3);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const pending = await prisma.booking.count({ 
      where: { stadiumId: stadium.id, status: 'PENDING', ...dateFilter } 
    });
    const confirmed = await prisma.booking.count({ 
      where: { stadiumId: stadium.id, status: 'CONFIRMED', ...dateFilter } 
    });
    const cancelled = await prisma.booking.count({ 
      where: { stadiumId: stadium.id, status: 'CANCELLED', ...dateFilter } 
    });
    const paid = await prisma.booking.count({ 
      where: { 
        stadiumId: stadium.id, 
        payment: { status: 'PAID' },
        ...dateFilter
      } 
    });

    const revenueResult = await prisma.payment.aggregate({
      where: { 
        booking: { stadiumId: stadium.id, ...dateFilter }, 
        status: 'PAID' 
      },
      _sum: { amount: true }
    });

    res.json({
      pending,
      confirmed,
      cancelled,
      paid,
      revenue: revenueResult._sum.amount || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner/insights — owner sees booking insights (chart data)
export const getOwnerInsights = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const { date } = req.query;
    
    // Find the owner's stadium first
    const stadium = await prisma.stadium.findUnique({ where: { ownerId } });
    if (!stadium) return res.json([]);

    // Get a 7-day window around the provided date or today
    const baseDate = date ? new Date(date) : new Date();
    const startDate = new Date(baseDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(baseDate.getDate() - 3);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const bookings = await prisma.booking.findMany({
      where: {
        stadiumId: stadium.id,
        payment: { status: 'PAID' },
        slot: {
          startTime: {
            gte: startDate,
            lt: endDate
          }
        }
      },
      include: { slot: { select: { startTime: true } } }
    });

    const insights = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const count = bookings.filter(b => {
        return b.slot.startTime.toISOString().split('T')[0] === dateStr;
      }).length;

      insights.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/owner/recent — owner sees recent activity
export const getOwnerRecentActivity = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const stadium = await prisma.stadium.findUnique({ where: { ownerId } });
    if (!stadium) return res.json([]);

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { stadiumId: stadium.id },
      include: { 
        player: { select: { name: true } },
        slot: { select: { startTime: true, location: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get recent payments that were confirmed
    const recentPayments = await prisma.payment.findMany({
      where: { booking: { stadiumId: stadium.id }, status: 'PAID' },
      include: {
        booking: {
          include: {
            player: { select: { name: true } },
            slot: { select: { startTime: true, location: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const activities = [];

    recentBookings.forEach(b => {
      activities.push({
        id: `b-${b.id}`,
        type: 'BOOKING_CREATED',
        playerName: b.player.name,
        location: b.slot.location,
        bookingTime: b.slot.startTime,
        timestamp: b.createdAt,
        status: b.status
      });
    });

    recentPayments.forEach(p => {
      activities.push({
        id: `p-${p.id}`,
        type: 'PAYMENT_RECEIVED',
        playerName: p.booking.player.name,
        location: p.booking.slot.location,
        bookingTime: p.booking.slot.startTime,
        timestamp: p.updatedAt,
        amount: p.amount
      });
    });

    // Sort by timestamp desc and take top 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10));
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
