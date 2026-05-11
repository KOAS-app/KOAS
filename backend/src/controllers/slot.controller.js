import prisma from '../config/prisma.js';

// POST /api/slots — owner creates a single slot
export const createSlot = async (req, res) => {
  try {
    const { stadiumId, startTime, endTime, price } = req.body;

    // Verify stadium belongs to this owner
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Check for overlapping slots on the same stadium
    const overlap = await prisma.slot.findFirst({
      where: {
        stadiumId,
        OR: [
          { startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
        ],
      },
    });
    if (overlap) {
      return res.status(400).json({ message: 'Slot overlaps with an existing slot' });
    }

    const slot = await prisma.slot.create({
      data: {
        stadiumId,
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

// POST /api/slots/bulk — owner bulk-generates hourly slots for a day
export const bulkCreateSlots = async (req, res) => {
  try {
    const { stadiumId, date, openHour, closeHour, price } = req.body;
    // date: "2026-05-12", openHour: 8, closeHour: 22, price: 500

    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
      const end   = new Date(`${date}T${String(hour + 1).padStart(2, '0')}:00:00`);

      // Skip if overlapping slot already exists
      const overlap = await prisma.slot.findFirst({
        where: {
          stadiumId,
          OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
        },
      });
      if (!overlap) {
        slots.push({ stadiumId, startTime: start, endTime: end, price: parseFloat(price) });
      }
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
