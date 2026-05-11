import prisma from '../config/prisma.js';

// POST /api/stadiums — owner creates a stadium
export const createStadium = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    const stadium = await prisma.stadium.create({
      data: {
        name,
        location,
        description,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stadiums — list all approved stadiums (public)
export const getStadiums = async (req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      where: { isApproved: true },
      include: { owner: { select: { id: true, name: true } } },
    });

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stadiums/:id — single stadium with slots
export const getStadiumById = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true } },
        slots: { where: { isBooked: false } },
      },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });

    res.json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/stadiums/:id — owner updates their stadium
export const updateStadium = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { id: req.params.id },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const updated = await prisma.stadium.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/stadiums/:id — owner deletes their stadium
export const deleteStadium = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { id: req.params.id },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    await prisma.stadium.delete({ where: { id: req.params.id } });

    res.json({ message: 'Stadium deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stadiums/my — owner sees their own stadiums
export const getMyStadiums = async (req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      where: { ownerId: req.user.id },
    });

    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
