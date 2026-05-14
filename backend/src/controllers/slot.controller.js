import prisma from '../config/prisma.js';

// POST /api/slots — owner creates a single slot
export const createSlot = async (req, res) => {
  try {
    const { stadiumId, location, startTime, endTime, price } = req.body;

    // Verify stadium belongs to this owner
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Verify location exists in stadium locations
    if (!stadium.locations.includes(location)) {
      return res.status(400).json({ message: 'Invalid location for this stadium' });
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

    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Verify location exists in stadium locations
    if (!stadium.locations.includes(location)) {
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
      
      const start = new Date(`${date}T${String(startHourInt).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`);
      const end = new Date(`${date}T${String(endHourInt).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`);

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

// DELETE /api/slots/:id — owner deletes an unbooked slot
export const deleteSlot = async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({ where: { id: req.params.id } });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ message: 'Cannot delete a booked slot' });

    const stadium = await prisma.stadium.findUnique({ where: { id: slot.stadiumId } });
    if (stadium?.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    await prisma.slot.delete({ where: { id: req.params.id } });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
