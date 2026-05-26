import prisma from '../config/prisma.js';

// Helper to parse AM/PM time (e.g. "08:00 AM", "10:30 PM") into minutes from midnight (0 - 1439)
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
  if (!match) return 0;
  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  ampm = ampm.toUpperCase();
  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

// Helper to calculate calendar week range (Monday to Sunday) for a given date
const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust so Monday is first day of week (day === 0 is Sunday, which goes back 6 days)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

// POST /api/bookings — player books a slot (or multiple slots)
export const createBooking = async (req, res) => {
  try {
    const { slotId, slotIds } = req.body;

    const idsToBook = Array.isArray(slotIds) ? slotIds : (slotId ? [slotId] : []);
    if (idsToBook.length === 0) {
      return res.status(400).json({ message: 'No slot ID(s) provided' });
    }

    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

    // Use a transaction to prevent race conditions — check + update happen atomically
    const bookings = await prisma.$transaction(async (tx) => {
      const results = [];
      const newBookedDaysThisTransaction = new Set();

      for (const id of idsToBook) {
        const slot = await tx.slot.findUnique({ where: { id } });

        if (!slot) throw Object.assign(new Error('Slot not found'), { status: 404 });
        if (slot.isBooked) throw Object.assign(new Error('Slot already booked'), { status: 400 });

        if (new Date(slot.startTime) < new Date()) {
          throw Object.assign(new Error('Cannot book a slot in the past'), { status: 400 });
        }

        // Generate unique booking code inside transaction
        let bookingCode;
        let isCodeUnique = false;
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        
        while (!isCodeUnique) {
          const randomPart = Array.from({ length: 6 }, () => 
            chars.charAt(Math.floor(Math.random() * chars.length))
          ).join('');
          bookingCode = `BK-${randomPart}`;
          
          const existing = await tx.booking.findUnique({
            where: { bookingCode }
          });
          
          if (!existing) {
            isCodeUnique = true;
          }
        }

        // Check if player has an active subscription at this stadium
        const activeSub = await tx.playerSubscription.findFirst({
          where: {
            playerId: req.user.id,
            status: 'ACTIVE',
            subscriptionPlan: {
              stadiumId: slot.stadiumId,
            },
            startDate: { lte: slot.startTime },
            endDate: { gte: slot.startTime },
          },
          include: {
            subscriptionPlan: true,
          },
        });

        let isSubscriptionBooking = false;

        if (activeSub) {
          const plan = activeSub.subscriptionPlan;

          // 1. Validate days of week
          const slotDayIndex = new Date(slot.startTime).getDay();
          const openDayIndex = dayMap[plan.openingDay] !== undefined ? dayMap[plan.openingDay] : 1; // default Monday
          const closeDayIndex = dayMap[plan.closingDay] !== undefined ? dayMap[plan.closingDay] : 0; // default Sunday

          let isDayAllowed = false;
          if (openDayIndex <= closeDayIndex) {
            isDayAllowed = slotDayIndex >= openDayIndex && slotDayIndex <= closeDayIndex;
          } else {
            // Wraps around week boundary
            isDayAllowed = slotDayIndex >= openDayIndex || slotDayIndex <= closeDayIndex;
          }

          if (!isDayAllowed) {
            throw Object.assign(new Error(`Booking day is not within subscription plan's allowed days (${plan.openingDay} to ${plan.closingDay})`), { status: 400 });
          }

          // 2. Validate hours of day
          const slotStart = new Date(slot.startTime);
          const slotEnd = new Date(slot.endTime);
          const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
          
          let slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();
          if (slotEndMinutes === 0 && slotEnd.getDate() !== slotStart.getDate()) {
            slotEndMinutes = 1440;
          }

          const planStartMinutes = parseTimeToMinutes(plan.openingTime);
          const planEndMinutes = parseTimeToMinutes(plan.closingTime);

          let isTimeAllowed = false;
          if (planStartMinutes <= planEndMinutes) {
            isTimeAllowed = slotStartMinutes >= planStartMinutes && slotEndMinutes <= planEndMinutes;
          } else {
            // Wraps around midnight
            isTimeAllowed = slotStartMinutes >= planStartMinutes || slotEndMinutes <= planEndMinutes;
          }

          if (!isTimeAllowed) {
            throw Object.assign(new Error(`Booking hours fall outside the allowed subscription plan's hours (${plan.openingTime} to ${plan.closingTime})`), { status: 400 });
          }

          // 2b. Validate hours per day limit
          const slotDurationHours = (slotEnd - slotStart) / (1000 * 60 * 60); // Convert milliseconds to hours
          const maxHoursPerDay = plan.hoursPerDay || 1.0;

          // Get all bookings for the same day
          const slotDayStart = new Date(slot.startTime);
          slotDayStart.setHours(0, 0, 0, 0);
          const slotDayEnd = new Date(slot.startTime);
          slotDayEnd.setHours(23, 59, 59, 999);

          const sameDayBookings = await tx.booking.findMany({
            where: {
              playerId: req.user.id,
              stadiumId: slot.stadiumId,
              status: { in: ['CONFIRMED', 'PENDING'] },
              slot: {
                startTime: {
                  gte: slotDayStart,
                  lte: slotDayEnd,
                },
              },
            },
            include: { slot: true },
          });

          // Calculate total hours already booked on this day
          let totalHoursBookedToday = 0;
          for (const booking of sameDayBookings) {
            const bookingStart = new Date(booking.slot.startTime);
            const bookingEnd = new Date(booking.slot.endTime);
            const bookingDuration = (bookingEnd - bookingStart) / (1000 * 60 * 60);
            totalHoursBookedToday += bookingDuration;
          }

          // Check if adding this slot would exceed the daily limit
          if (totalHoursBookedToday + slotDurationHours > maxHoursPerDay) {
            throw Object.assign(
              new Error(`Daily hours limit exceeded: Your subscription allows ${maxHoursPerDay} hour${maxHoursPerDay !== 1 ? 's' : ''} per day. You have already booked ${totalHoursBookedToday.toFixed(1)} hour${totalHoursBookedToday !== 1 ? 's' : ''} on this day.`),
              { status: 400 }
            );
          }

          // 3. Validate weekly limit (based on weeklyAllowedDays)
          const weeklyLimit = plan.weeklyAllowedDays || 1;
          const { monday, sunday } = getWeekRange(slot.startTime);
          const weeklyBookings = await tx.booking.findMany({
            where: {
              playerId: req.user.id,
              stadiumId: slot.stadiumId,
              status: { in: ['CONFIRMED', 'PENDING'] },
              slot: {
                startTime: {
                  gte: monday,
                  lte: sunday,
                },
              },
            },
            include: { slot: true },
          });

          const bookedDays = new Set(
            weeklyBookings.map((b) => new Date(b.slot.startTime).toISOString().split('T')[0])
          );
          // Include days processed in this exact transaction to avoid overlapping bookings in bulk creation
          newBookedDaysThisTransaction.forEach(day => bookedDays.add(day));

          const newSlotDayStr = new Date(slot.startTime).toISOString().split('T')[0];

          if (bookedDays.size >= weeklyLimit && !bookedDays.has(newSlotDayStr)) {
            throw Object.assign(
              new Error(`Subscription limit exceeded: You can only play on ${weeklyLimit} day${weeklyLimit > 1 ? 's' : ''} per week under your membership.`),
              { status: 400 }
            );
          }

          // 4. Validate total limit (based on duration and weekly limit)
          const totalLimit = weeklyLimit * Math.floor(plan.duration / 7);
          const allSubBookings = await tx.booking.findMany({
            where: {
              playerId: req.user.id,
              stadiumId: slot.stadiumId,
              status: { in: ['CONFIRMED', 'PENDING'] },
              slot: {
                startTime: {
                  gte: activeSub.startDate,
                  lte: activeSub.endDate,
                },
              },
            },
            include: { slot: true },
          });

          const distinctSubDays = new Set(
            allSubBookings.map((b) => new Date(b.slot.startTime).toISOString().split('T')[0])
          );
          newBookedDaysThisTransaction.forEach(day => distinctSubDays.add(day));

          if (distinctSubDays.size >= totalLimit && !distinctSubDays.has(newSlotDayStr)) {
            throw Object.assign(
              new Error(`Subscription limit exceeded: Your ${plan.duration}-day plan allows booking on a maximum of ${totalLimit} distinct days in total.`),
              { status: 400 }
            );
          }

          // Add to local booked tracker
          newBookedDaysThisTransaction.add(newSlotDayStr);
          isSubscriptionBooking = true;
        }

        // Lock/update the slot
        await tx.slot.update({
          where: { id },
          data: { isBooked: true },
        });

        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            playerId: req.user.id,
            stadiumId: slot.stadiumId,
            slotId: id,
            bookingCode,
            status: isSubscriptionBooking ? 'CONFIRMED' : 'PENDING',
          },
          include: { slot: true, stadium: true },
        });

        // Create payment
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: slot.price,
            method: isSubscriptionBooking ? 'SUBSCRIPTION' : 'CASH',
            status: isSubscriptionBooking ? 'PAID' : 'PENDING',
          },
        });

        results.push(newBooking);
      }
      return results;
    });

    res.status(201).json(Array.isArray(slotIds) ? bookings : bookings[0]);
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
// Excludes bookings from users with active subscriptions
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const stadium = await prisma.stadium.findUnique({ where: { ownerId } });
    if (!stadium) return res.json([]);

    const { status, search, date } = req.query;

    // Get all active subscription player IDs for this stadium
    const activeSubscriptions = await prisma.playerSubscription.findMany({
      where: {
        subscriptionPlan: { stadiumId: stadium.id },
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      select: { playerId: true }
    });

    const subscribedPlayerIds = activeSubscriptions.map(sub => sub.playerId);

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
        playerId: { notIn: subscribedPlayerIds }, // Exclude subscribed players
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

// GET /api/bookings/verify/:code — verify booking code (owner only)
export const verifyBookingCode = async (req, res) => {
  try {
    const { code } = req.params;

    // Find booking by code
    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        slot: true,
        stadium: {
          select: { id: true, name: true, ownerId: true },
        },
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
        payment: {
          select: { status: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking code not found.' });
    }

    // Verify that the booking belongs to the owner's stadium
    if (booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'This booking does not belong to your stadium.' });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
