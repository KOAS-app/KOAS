import prisma from '../config/prisma.js';
import { getActiveTier } from '../utils/tier.js';

// POST /api/locations — create a location for a stadium
export const createLocation = async (req, res) => {
  try {
    const { name, address, images } = req.body;
    const { stadiumId } = req.params;

    const cleanName = name ? name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'Main Branch';

    // Verify the stadium belongs to this owner
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: { locations: true },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    // Check tier limit for number of locations
    const activeTier = await getActiveTier(req.user.id);
    const newCount = stadium.locations.length + 1;
    if (activeTier === 'STARTER' && newCount > 1) {
      return res.status(400).json({
        message: 'Subscription limit reached: Starter tier is limited to 1 branch location. Upgrade your plan to manage more branches.'
      });
    }
    if (activeTier === 'PRO' && newCount > 3) {
      return res.status(400).json({
        message: 'Subscription limit reached: Pro tier is limited to 3 branch locations. Upgrade your plan to manage more branches.'
      });
    }

    const location = await prisma.location.create({
      data: {
        name: cleanName,
        address: address || null,
        images: images || [],
        stadiumId,
      },
    });

    res.status(201).json(location);
  } catch (err) {
    console.error('Create location error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/locations/stadium/:stadiumId — get all locations for a stadium
export const getLocations = async (req, res) => {
  try {
    const { stadiumId } = req.params;

    const locations = await prisma.location.findMany({
      where: { stadiumId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(locations);
  } catch (err) {
    console.error('Get locations error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/locations/:id — get single location
export const getLocationById = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
    });

    if (!location) return res.status(404).json({ message: 'Location not found' });

    res.json(location);
  } catch (err) {
    console.error('Get location error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/locations/:id — update a location
export const updateLocation = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: { stadium: { select: { ownerId: true } } },
    });

    if (!location) return res.status(404).json({ message: 'Location not found' });
    if (location.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const { name, address, images } = req.body;
    const cleanName = name !== undefined ? name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : undefined;

    const updated = await prisma.location.update({
      where: { id: req.params.id },
      data: {
        ...(cleanName !== undefined && { name: cleanName }),
        ...(address !== undefined && { address }),
        ...(images !== undefined && { images }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/locations/:id — delete a location
export const deleteLocation = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: { stadium: { select: { ownerId: true } } },
    });

    if (!location) return res.status(404).json({ message: 'Location not found' });
    if (location.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    await prisma.location.delete({ where: { id: req.params.id } });

    res.json({ message: 'Location deleted' });
  } catch (err) {
    console.error('Delete location error:', err);
    res.status(500).json({ message: err.message });
  }
};
