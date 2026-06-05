import prisma from '../config/prisma.js';
import { getActiveTier } from '../utils/tier.js';

// POST /api/slots — owner creates a single slot
export const createSlot = async (req, res) => {
  try {
    const { stadiumId, location, startTime, endTime, price } = req.body;

    // Verify stadium belongs to this owner
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId }, include: { locations: true } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Verify location exists in stadium locations
    if (!stadium.locations.some(l => l.name === location)) {
      return res.status(400).json({ message: 'Invalid location for this stadium' });
    }

    if (new Date(startTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot create a slot in the past' });
    }

    // Check for overlapping slots on the same stadium and location
    const overlap = await prisma.slot.findFirst({
      where: {
        stadiumId,
        location,
        OR: [
          { startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
        ],
      },
    });
    if (overlap) {
      return res.status(400).json({ message: 'Slot overlaps with an existing slot at this location' });
    }

    const slot = await prisma.slot.create({
      data: {
        stadiumId,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price: parseFloat(price),
      },
    });

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/slots/bulk — owner bulk-generates slots for a day with custom duration
export const bulkCreateSlots = async (req, res) => {
  try {
    const { stadiumId, location, date, openHour, closeHour, price, duration = 1 } = req.body;
    // date: "2026-05-12", openHour: 8, closeHour: 22, price: 500, duration: 1 (in hours)

    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId }, include: { locations: true } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const activeTier = await getActiveTier(req.user.id);
    if (activeTier === 'STARTER') {
      return res.status(403).json({ 
        message: 'Feature locked: Starter plan does not support the Automatic Slot Generator flow. Upgrade your plan to auto-generate slot templates.' 
      });
    }

    // Verify location exists in stadium locations
    if (!stadium.locations.some(l => l.name === location)) {
      return res.status(400).json({ message: 'Invalid location for this stadium' });
    }

    // Validate duration
    const slotDuration = parseFloat(duration);
    if (slotDuration <= 0 || slotDuration > 24) {
      return res.status(400).json({ message: 'Duration must be between 0 and 24 hours' });
    }

    const slots = [];
    let currentHour = openHour;
    
    while (currentHour < closeHour) {
      // Calculate end hour (can be fractional for durations like 1.5 hours)
      const endHour = Math.min(currentHour + slotDuration, closeHour);
      
      // Convert hours to time strings
      const startHourInt = Math.floor(currentHour);
      const startMinutes = Math.round((currentHour - startHourInt) * 60);
      const endHourInt = Math.floor(endHour);
      const endMinutes = Math.round((endHour - endHourInt) * 60);
      
      const start = new Date(`${date}T${String(startHourInt).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00Z`);
      const end = new Date(`${date}T${String(endHourInt).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00Z`);

      // Skip if overlapping slot already exists at this location
      const overlap = await prisma.slot.findFirst({
        where: {
          stadiumId,
          location,
          OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
        },
      });
      
      if (!overlap) {
        slots.push({ stadiumId, location, startTime: start, endTime: end, price: parseFloat(price) });
      }
      
      // Move to next slot
      currentHour = endHour;
    }

    const created = await prisma.slot.createMany({ data: slots });
    res.status(201).json({ created: created.count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/slots/:stadiumId — get all slots for a stadium
export const getSlotsByStadium = async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      where: { stadiumId: req.params.stadiumId },
      orderBy: { startTime: 'asc' },
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/slots/generate-from-plan — Auto-generate slots based on subscription plan
export const generateSlotsFromPlan = async (req, res) => {
  try {
    const { subscriptionPlanId, location, startDate, endDate, slotDuration, price } = req.body;

    // Fetch the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
      include: { stadium: { include: { locations: true } } }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Verify owner owns this stadium
    if (plan.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Verify location exists in stadium locations
    if (!plan.stadium.locations.some(l => l.name === location)) {
      return res.status(400).json({ message: 'Invalid location for this stadium' });
    }

    // Check tier
    const activeTier = await getActiveTier(req.user.id);
    if (activeTier === 'STARTER') {
      return res.status(403).json({ 
        message: 'Feature locked: Starter plan does not support the Automatic Slot Generator flow. Upgrade your plan to auto-generate slot templates.' 
      });
    }

    // Parse plan constraints
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const openDayIndex = dayMap[plan.openingDay] || 1;
    const closeDayIndex = dayMap[plan.closingDay] || 0;

    // Parse time strings to hours (e.g., "08:00 AM" -> 8, "10:30 PM" -> 22.5)
    const parseTimeToHours = (timeStr) => {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours + (minutes / 60);
    };

    const openHour = parseTimeToHours(plan.openingTime);
    const closeHour = parseTimeToHours(plan.closingTime);
    const duration = parseFloat(slotDuration);

    if (duration <= 0 || duration > 24) {
      return res.status(400).json({ message: 'Slot duration must be between 0 and 24 hours' });
    }

    // Generate slots for each day in the date range
    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      
      // Check if this day is within the plan's allowed days
      let isDayAllowed = false;
      if (openDayIndex <= closeDayIndex) {
        isDayAllowed = dayOfWeek >= openDayIndex && dayOfWeek <= closeDayIndex;
      } else {
        // Wraps around week (e.g., Saturday to Monday)
        isDayAllowed = dayOfWeek >= openDayIndex || dayOfWeek <= closeDayIndex;
      }

      if (!isDayAllowed) continue;

      // Generate slots for this day
      let currentHour = openHour;
      const dateStr = d.toISOString().split('T')[0];

      while (currentHour < closeHour) {
        const endHour = Math.min(currentHour + duration, closeHour);
        
        const startHourInt = Math.floor(currentHour);
        const startMinutes = Math.round((currentHour - startHourInt) * 60);
        const endHourInt = Math.floor(endHour);
        const endMinutes = Math.round((endHour - endHourInt) * 60);
        
        const slotStart = new Date(`${dateStr}T${String(startHourInt).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00Z`);
        const slotEnd = new Date(`${dateStr}T${String(endHourInt).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00Z`);

        // Skip if in the past
        if (slotStart < new Date()) {
          currentHour = endHour;
          continue;
        }

        // Check for overlaps
        const overlap = await prisma.slot.findFirst({
          where: {
            stadiumId: plan.stadiumId,
            location,
            OR: [{ startTime: { lt: slotEnd }, endTime: { gt: slotStart } }],
          },
        });

        if (!overlap) {
          slots.push({
            stadiumId: plan.stadiumId,
            location,
            startTime: slotStart,
            endTime: slotEnd,
            price: parseFloat(price)
          });
        }

        currentHour = endHour;
      }
    }

    if (slots.length === 0) {
      return res.status(400).json({ message: 'No slots generated. Check date range and plan constraints.' });
    }

    const created = await prisma.slot.createMany({ data: slots });
    res.status(201).json({ 
      created: created.count,
      message: `Successfully generated ${created.count} slots based on plan constraints`
    });
  } catch (err) {
    console.error('Generate slots from plan error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/slots/:id — owner updates a slot (only if not booked)
export const updateSlot = async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({ where: { id: req.params.id } });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const stadium = await prisma.stadium.findUnique({ where: { id: slot.stadiumId }, include: { locations: true } });
    if (stadium?.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot edit a booked slot' });
    }

    const { location, startTime, endTime, price } = req.body;

    // If location is being updated, verify it exists in stadium locations
    if (location && !stadium.locations.some(l => l.name === location)) {
      return res.status(400).json({ message: 'Invalid location for this stadium' });
    }

    const updates = {};
    if (location !== undefined) updates.location = location;
    if (startTime !== undefined) updates.startTime = new Date(startTime);
    if (endTime !== undefined) updates.endTime = new Date(endTime);
    if (price !== undefined) updates.price = parseFloat(price);

    // Check for overlapping slots if times are changing
    if (startTime || endTime) {
      const overlap = await prisma.slot.findFirst({
        where: {
          stadiumId: slot.stadiumId,
          location: location || slot.location,
          id: { not: slot.id },
          OR: [
            {
              startTime: { lt: endTime ? new Date(endTime) : slot.endTime },
              endTime: { gt: startTime ? new Date(startTime) : slot.startTime },
            },
          ],
        },
      });
      if (overlap) {
        return res.status(400).json({ message: 'Slot overlaps with an existing slot at this location' });
      }
    }

    const updated = await prisma.slot.update({
      where: { id: req.params.id },
      data: updates,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/slots/bulk-delete — owner deletes multiple slots at once
export const bulkDeleteSlots = async (req, res) => {
  try {
    const { ids } = req.body;

    const slots = await prisma.slot.findMany({
      where: { id: { in: ids } },
      include: { booking: true },
    });

    if (slots.length !== ids.length) {
      return res.status(404).json({ message: 'One or more slots not found' });
    }

    // Verify all slots belong to the owner
    const stadiumIds = [...new Set(slots.map(s => s.stadiumId))];
    const stadiums = await prisma.stadium.findMany({
      where: { id: { in: stadiumIds } },
    });

    for (const stadium of stadiums) {
      if (stadium.ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Not your stadium' });
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const slot of slots) {
        if (slot.booking) {
          await tx.payment.deleteMany({ where: { bookingId: slot.booking.id } });
          await tx.booking.delete({ where: { id: slot.booking.id } });
        }
      }
      await tx.slot.deleteMany({ where: { id: { in: ids } } });
    });

    res.json({ message: `${ids.length} slot(s) deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/slots/all/:stadiumId — owner deletes ALL slots for their stadium
export const deleteAllSlots = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({ where: { id: req.params.stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Get all slot IDs with their bookings
    const slots = await prisma.slot.findMany({
      where: { stadiumId: req.params.stadiumId },
      select: { id: true, booking: { select: { id: true } } },
    });

    const slotIds = slots.map(s => s.id);
    const bookingIds = slots.filter(s => s.booking).map(s => s.booking.id);

    await prisma.$transaction(async (tx) => {
      if (bookingIds.length > 0) {
        await tx.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      await tx.slot.deleteMany({ where: { id: { in: slotIds } } });
    });

    res.json({ message: `${slotIds.length} slot(s) deleted.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/slots/:id — owner deletes a slot (cascades to booking and payment)
export const deleteSlot = async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({ 
      where: { id: req.params.id },
      include: { booking: true }
    });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const stadium = await prisma.stadium.findUnique({ where: { id: slot.stadiumId } });
    if (stadium?.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    await prisma.$transaction(async (tx) => {
      if (slot.booking) {
        // Delete associated payment
        await tx.payment.deleteMany({
          where: { bookingId: slot.booking.id }
        });
        
        // Delete the booking
        await tx.booking.delete({
          where: { id: slot.booking.id }
        });
      }

      // Delete the slot
      await tx.slot.delete({ where: { id: req.params.id } });
    });

    res.json({ message: 'Slot and any associated bookings deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
