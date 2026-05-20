import prisma from '../config/prisma.js';
import { getActiveTier } from '../utils/tier.js';

// POST /api/reviews — player creates/updates a review for a stadium
export const createOrUpdateReview = async (req, res) => {
  try {
    const { stadiumId, rating, comment } = req.body;
    const playerId = req.user.id;

    // Verify stadium exists
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });

    // Check if player has booked this stadium at least once
    const hasBooked = await prisma.booking.findFirst({
      where: {
        playerId,
        stadiumId,
        status: 'CONFIRMED',
      },
    });

    if (!hasBooked) {
      return res.status(403).json({ message: 'You can only review stadiums you have booked' });
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        stadiumId_playerId: { stadiumId, playerId },
      },
      update: {
        rating,
        comment,
      },
      create: {
        stadiumId,
        playerId,
        rating,
        comment,
      },
      include: {
        player: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/stadium/:stadiumId — get all reviews for a stadium with average rating
export const getStadiumReviews = async (req, res) => {
  try {
    const { stadiumId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { stadiumId },
      include: {
        player: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/my-review/:stadiumId — get current player's review for a stadium
export const getMyReview = async (req, res) => {
  try {
    const { stadiumId } = req.params;
    const playerId = req.user.id;

    const review = await prisma.review.findUnique({
      where: {
        stadiumId_playerId: { stadiumId, playerId },
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'No review found' });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id — player deletes their own review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.playerId !== playerId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/player/:playerId — get all reviews by a player
export const getPlayerReviews = async (req, res) => {
  try {
    const { playerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { playerId },
      include: {
        stadium: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reviews/:id/reply — owner replies to a review
export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const ownerId = req.user.id;

    const activeTier = await getActiveTier(ownerId);
    if (activeTier === 'STARTER') {
      return res.status(403).json({ 
        message: 'Feature locked: Starter plan does not support replying to reviews. Upgrade your plan to unlock review interactions.' 
      });
    }

    // Get the review with stadium info
    const review = await prisma.review.findUnique({
      where: { id },
      include: { stadium: true },
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Verify the stadium belongs to this owner
    if (review.stadium.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You can only reply to reviews for your own stadiums' });
    }

    // Update the review with owner's reply
    const updated = await prisma.review.update({
      where: { id },
      data: {
        ownerReply: reply,
        repliedAt: new Date(),
      },
      include: {
        player: {
          select: { id: true, name: true },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id/reply — owner deletes their reply
export const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    // Get the review with stadium info
    const review = await prisma.review.findUnique({
      where: { id },
      include: { stadium: true },
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Verify the stadium belongs to this owner
    if (review.stadium.ownerId !== ownerId) {
      return res.status(403).json({ message: 'You can only delete replies for your own stadiums' });
    }

    // Remove the reply
    await prisma.review.update({
      where: { id },
      data: {
        ownerReply: null,
        repliedAt: null,
      },
    });

    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
