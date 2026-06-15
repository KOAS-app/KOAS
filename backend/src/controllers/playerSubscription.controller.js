import prisma from '../config/prisma.js';

// Helper to generate a unique subscription code: e.g., KS-ABCD-EFGH
const generateUniqueCode = async () => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `KS-${part1}-${part2}`;

    const existing = await prisma.playerSubscription.findUnique({
      where: { subscriptionCode: code }
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Lazy evaluation helper: updates subscription to EXPIRED if past endDate
const checkAndExpireSubscription = async (sub) => {
  if (sub.status === 'ACTIVE' && sub.endDate && new Date() > new Date(sub.endDate)) {
    return await prisma.playerSubscription.update({
      where: { id: sub.id },
      data: { status: 'EXPIRED' },
      include: {
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        subscriptionPlan: {
          include: { stadium: true }
        }
      }
    });
  }
  return sub;
};

// POST /api/player-subscriptions/subscribe — Player submits membership application with payment receipt
export const subscribeToPlan = async (req, res) => {
  try {
    const { subscriptionPlanId, pricePaid, receiptImageUrl, selectedSlotIds } = req.body;

    if (!subscriptionPlanId || pricePaid === undefined || pricePaid === null || !receiptImageUrl) {
      return res.status(400).json({ message: 'Missing required checkout details.' });
    }

    const parsedPrice = parseFloat(pricePaid);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: 'Invalid price value provided.' });
    }

    // Verify the subscription plan exists and is active
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
      include: { stadium: true }
    });

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: 'This subscription plan is currently inactive.' });
    }

    // Check for an existing PENDING or RECEIPT_SUBMITTED application for this stadium
    const existingPending = await prisma.playerSubscription.findFirst({
      where: {
        playerId: req.user.id,
        subscriptionPlan: { stadiumId: plan.stadiumId },
        status: { in: ['RECEIPT_SUBMITTED', 'PENDING'] }
      }
    });

    if (existingPending) {
      return res.status(400).json({
        message: 'You already have a pending membership application at this stadium. Please wait for the owner to review it.',
      });
    }

    // Verify player does not already have an active subscription for this stadium
    const existingActive = await prisma.playerSubscription.findFirst({
      where: {
        playerId: req.user.id,
        subscriptionPlan: { stadiumId: plan.stadiumId },
        status: 'ACTIVE'
      }
    });

    if (existingActive) {
      // Lazy check in case it's actually expired
      const checked = await checkAndExpireSubscription(existingActive);
      if (checked.status === 'ACTIVE') {
        return res.status(400).json({
          message: 'You already have an active membership at this stadium.',
          subscription: checked
        });
      }
    }

    // Generate unique membership code
    const subscriptionCode = await generateUniqueCode();

    // Create the subscription application
    const subscription = await prisma.playerSubscription.create({
      data: {
        playerId: req.user.id,
        subscriptionPlanId,
        subscriptionCode,
        pricePaid: parsedPrice,
        receiptImageUrl,
        status: 'RECEIPT_SUBMITTED',
        playerSubmittedAt: new Date(),
        selectedSlotIds: selectedSlotIds || []
      },
      include: {
        subscriptionPlan: {
          include: { stadium: true }
        }
      }
    });

    res.status(201).json({
      message: 'Subscription request submitted successfully. Waiting for stadium owner approval.',
      subscription
    });
  } catch (error) {
    console.error('Player subscribe error:', error);
    const message = process.env.NODE_ENV !== 'production' && error?.message
      ? error.message
      : 'Failed to process subscription request.';
    res.status(500).json({ message });
  }
};

// GET /api/player-subscriptions/my — Player views their memberships
export const getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.playerSubscription.findMany({
      where: { playerId: req.user.id },
      include: {
        subscriptionPlan: {
          include: { stadium: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check and update expiry on all returned subscriptions
    const processed = await Promise.all(
      subscriptions.map(async (sub) => {
        const expired = await checkAndExpireSubscription(sub);

        // Fetch slot details for selectedSlotIds
        let slots = [];
        if (expired.selectedSlotIds && expired.selectedSlotIds.length > 0) {
          slots = await prisma.slot.findMany({
            where: { id: { in: expired.selectedSlotIds } },
            orderBy: { startTime: 'asc' }
          });
        }

        return { ...expired, slots };
      })
    );

    res.json(processed);
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ message: 'Failed to retrieve your subscriptions.' });
  }
};

// GET /api/player-subscriptions/requests — Owner views pending applications for their stadium
export const getSubscriptionRequests = async (req, res) => {
  try {
    // Get owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id }
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found. Create a stadium first.' });
    }

    const requests = await prisma.playerSubscription.findMany({
      where: {
        subscriptionPlan: { stadiumId: stadium.id },
        status: 'RECEIPT_SUBMITTED'
      },
      include: {
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        subscriptionPlan: true
      },
      orderBy: { playerSubmittedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get subscription requests error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription requests.' });
  }
};

// PATCH /api/player-subscriptions/:id/confirm — Owner approves & activates membership
export const confirmSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await prisma.playerSubscription.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true
      }
    });

    if (!sub) {
      return res.status(404).json({ message: 'Subscription request not found.' });
    }

    // Verify owner owns this stadium
    const stadium = await prisma.stadium.findFirst({
      where: {
        id: sub.subscriptionPlan.stadiumId,
        ownerId: req.user.id
      }
    });

    if (!stadium) {
      return res.status(403).json({ message: 'Unauthorized. Not your stadium.' });
    }

    if (sub.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Subscription is already active.' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + sub.subscriptionPlan.duration);

    // Use transaction to activate subscription and book selected slots
    const result = await prisma.$transaction(async (tx) => {
      // Update subscription status
      const updated = await tx.playerSubscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          ownerConfirmedAt: new Date(),
          startDate,
          endDate
        },
        include: {
          player: {
            select: { id: true, name: true, email: true, phoneNumber: true }
          },
          subscriptionPlan: {
            include: { stadium: true }
          }
        }
      });

      // Automatically book the selected slots
      if (sub.selectedSlotIds && sub.selectedSlotIds.length > 0) {
        for (const slotId of sub.selectedSlotIds) {
          const slot = await tx.slot.findUnique({ where: { id: slotId } });
          
          if (slot && !slot.isBooked) {
            // Mark slot as booked
            await tx.slot.update({
              where: { id: slotId },
              data: { isBooked: true }
            });

            // Create booking
            const booking = await tx.booking.create({
              data: {
                playerId: sub.playerId,
                stadiumId: slot.stadiumId,
                slotId: slotId,
                status: 'CONFIRMED'
              }
            });

            // Create payment record
            await tx.payment.create({
              data: {
                bookingId: booking.id,
                amount: slot.price,
                method: 'SUBSCRIPTION',
                status: 'PAID'
              }
            });
          }
        }
      }

      return updated;
    });

    res.json(result);
  } catch (error) {
    console.error('Confirm subscription error:', error);
    res.status(500).json({ message: 'Failed to confirm subscription.' });
  }
};

// PATCH /api/player-subscriptions/:id/reject — Owner rejects membership request
export const rejectSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sub = await prisma.playerSubscription.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true
      }
    });

    if (!sub) {
      return res.status(404).json({ message: 'Subscription request not found.' });
    }

    // Verify owner owns this stadium
    const stadium = await prisma.stadium.findFirst({
      where: {
        id: sub.subscriptionPlan.stadiumId,
        ownerId: req.user.id
      }
    });

    if (!stadium) {
      return res.status(403).json({ message: 'Unauthorized. Not your stadium.' });
    }

    const updated = await prisma.playerSubscription.update({
      where: { id },
      data: {
        status: 'REJECTED',
        ownerRejectedAt: new Date(),
        ownerRejectionReason: reason || 'Receipt rejected by stadium owner.'
      },
      include: {
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        subscriptionPlan: true
      }
    });

    res.json({
      message: 'Subscription request rejected.',
      subscription: updated
    });
  } catch (error) {
    console.error('Reject subscription error:', error);
    res.status(500).json({ message: 'Failed to reject subscription.' });
  }
};

// GET /api/player-subscriptions/verify/:code — Owner check-in membership verification
export const verifySubscriptionCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const formattedCode = code.trim().toUpperCase();

    const sub = await prisma.playerSubscription.findUnique({
      where: { subscriptionCode: formattedCode },
      include: {
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        subscriptionPlan: {
          include: { stadium: true }
        }
      }
    });

    if (!sub) {
      return res.status(404).json({ message: 'Invalid membership verification code. Code not found.' });
    }

    // Verify requesting owner is the owner of the stadium
    if (req.user.role === 'OWNER') {
      const stadium = await prisma.stadium.findUnique({
        where: { ownerId: req.user.id }
      });
      if (!stadium || sub.subscriptionPlan.stadiumId !== stadium.id) {
        return res.status(403).json({ message: 'Access denied. This subscription belongs to another stadium.' });
      }
    }

    // Check expiry dynamically
    const processed = await checkAndExpireSubscription(sub);

    res.json({
      message: 'Membership verified successfully.',
      subscription: processed
    });
  } catch (error) {
    console.error('Verify subscription code error:', error);
    res.status(500).json({ message: 'Failed to verify membership code.' });
  }
};

const VALID_SUBSCRIPTION_STATUSES = new Set(['PENDING', 'RECEIPT_SUBMITTED', 'ACTIVE', 'REJECTED', 'EXPIRED']);

// GET /api/player-subscriptions/owner/members — Owner views all members (active subscriptions)
export const getOwnerMembers = async (req, res) => {
  try {
    const { status, search, planId } = req.query;

    // Get owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id }
    });

    if (!stadium) {
      return res.json([]);
    }

    const where = {
      subscriptionPlan: {
        stadiumId: stadium.id,
        ...(planId && planId !== 'all' ? { id: planId } : {})
      }
    };

    if (status && status !== 'all') {
      const normalizedStatus = String(status).toUpperCase();
      if (!VALID_SUBSCRIPTION_STATUSES.has(normalizedStatus)) {
        return res.status(400).json({ message: 'Invalid status filter value.' });
      }
      where.status = normalizedStatus;
    }

    if (search) {
      where.OR = [
        { player: { name: { contains: search, mode: 'insensitive' } } },
        { player: { email: { contains: search, mode: 'insensitive' } } },
        { subscriptionCode: { contains: search, mode: 'insensitive' } }
      ];
    }

    const members = await prisma.playerSubscription.findMany({
      where,
      include: {
        player: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        subscriptionPlan: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check and update expiry on all returned subscriptions
    const processed = await Promise.all(
      members.map(async (sub) => {
        try {
          return await checkAndExpireSubscription(sub);
        } catch (err) {
          console.error('Failed to refresh subscription expiry for', sub.id, err);
          return sub;
        }
      })
    );

    res.json(processed);
  } catch (error) {
    console.error('Get owner members error:', error);
    res.status(500).json({ message: 'Failed to fetch members.' });
  }
};
