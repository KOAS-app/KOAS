import prisma from '../config/prisma.js';

// POST /api/stadiums — owner creates a stadium
export const createStadium = async (req, res) => {
  try {
    const { name, locations, description, imageUrl, amenities } = req.body;
    
    console.log('Creating stadium with data:', { name, locations, description, imageUrl, amenities });

    // Check if owner already has a stadium
    const existingStadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (existingStadium) {
      return res.status(400).json({ message: 'You already have a stadium. Please update it instead of creating a new one.' });
    }

    const stadium = await prisma.stadium.create({
      data: {
        name,
        locations,
        description,
        imageUrl,
        amenities: amenities || [],
        ownerId: req.user.id,
      },
    });

    console.log('Stadium created:', stadium);

    res.status(201).json(stadium);
  } catch (err) {
    console.error('Create stadium error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stadiums — list all approved stadiums (public)
export const getStadiums = async (req, res) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      where: { isApproved: true },
      include: { 
        owner: { select: { id: true, name: true } },
        reviews: { select: { rating: true } },
      },
    });

    // Add average rating to each stadium
    const stadiumsWithRating = stadiums.map(stadium => {
      const avgRating = stadium.reviews.length > 0
        ? stadium.reviews.reduce((sum, r) => sum + r.rating, 0) / stadium.reviews.length
        : 0;
      
      const { reviews, ...stadiumData } = stadium;
      return {
        ...stadiumData,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      };
    });

    res.json(stadiumsWithRating);
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
        slots: true, // Include all slots (both booked and available)
        reviews: { select: { rating: true } },
      },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });

    // Calculate average rating
    const avgRating = stadium.reviews.length > 0
      ? stadium.reviews.reduce((sum, r) => sum + r.rating, 0) / stadium.reviews.length
      : 0;

    const { reviews, ...stadiumData } = stadium;
    const stadiumWithRating = {
      ...stadiumData,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    };

    res.json(stadiumWithRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/stadiums/:id — owner updates their stadium
export const updateStadium = async (req, res) => {
  try {
    console.log('=== UPDATE STADIUM REQUEST ===');
    console.log('Request body:', req.body);
    
    const stadium = await prisma.stadium.findUnique({
      where: { id: req.params.id },
    });

    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    if (stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    const { name, locations, description, imageUrl, amenities } = req.body;
    
    console.log('Extracted values:', { name, locations, description, imageUrl, amenities });
    
    const updateData = { 
      name, 
      locations, 
      description, 
      imageUrl,
      amenities: amenities || []
    };
    
    console.log('Update data object:', updateData);
    
    const updated = await prisma.stadium.update({
      where: { id: req.params.id },
      data: updateData,
    });

    console.log('Stadium updated successfully:', updated);

    res.json(updated);
  } catch (err) {
    console.error('Update stadium error:', err);
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
