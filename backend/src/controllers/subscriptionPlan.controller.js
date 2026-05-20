import prisma from '../config/prisma.js';
import { getActiveTier } from '../utils/tier.js';

// Get active subscription plans for a specific stadium (Public / Player)
export const getSubscriptionPlansByStadium = async (req, res) => {
  try {
    const { stadiumId } = req.params;

    if (!stadiumId) {
      return res.status(400).json({ message: 'Stadium ID is required.' });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        stadiumId,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans by stadium error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans.' });
  }
};

// Get all subscription plans (active & inactive) for the owner's stadium (Owner only)
export const getMySubscriptionPlans = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found. Please create a stadium first.' });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: { stadiumId: stadium.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(plans);
  } catch (error) {
    console.error('Get my subscription plans error:', error);
    res.status(500).json({ message: 'Failed to fetch your subscription plans.' });
  }
};

// Create a new subscription plan (Owner only)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, duration, description, isActive } = req.body;

    // Get owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
      include: { subscriptionPlans: true },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found. Please create a stadium first.' });
    }

    // Resolve owner tier and apply limit
    const activeTier = await getActiveTier(req.user.id);
    let maxPlans = 10;
    if (activeTier === 'STARTER') {
      maxPlans = 1;
    } else if (activeTier === 'PRO') {
      maxPlans = 3;
    }

    if (stadium.subscriptionPlans.length >= maxPlans) {
      return res.status(400).json({
        message: `Your ${activeTier} plan allows a maximum of ${maxPlans} player subscription plan${maxPlans > 1 ? 's' : ''}.`
      });
    }

    // Create the plan
    const plan = await prisma.subscriptionPlan.create({
      data: {
        stadiumId: stadium.id,
        name,
        price,
        duration,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ message: 'Failed to create subscription plan.' });
  }
};

// Update an existing subscription plan (Owner only)
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, description, isActive } = req.body;

    // Verify owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found.' });
    }

    // Check if subscription plan exists and belongs to this stadium
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.stadiumId !== stadium.id) {
      return res.status(404).json({ message: 'Subscription plan not found or unauthorized.' });
    }

    // Update the plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({ message: 'Failed to update subscription plan.' });
  }
};

// Delete a subscription plan (Owner only)
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found.' });
    }

    // Check if subscription plan exists and belongs to this stadium
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existingPlan || existingPlan.stadiumId !== stadium.id) {
      return res.status(404).json({ message: 'Subscription plan not found or unauthorized.' });
    }

    // Delete the plan
    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    res.json({ message: 'Subscription plan deleted successfully.' });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(500).json({ message: 'Failed to delete subscription plan.' });
  }
};
