import prisma from '../config/prisma.js';

// GET /api/payments/booking/:bookingId — get payment for a booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: req.params.bookingId },
      include: {
        booking: {
          include: { stadium: true, slot: true },
        },
      },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const isOwner  = payment.booking.stadium.ownerId === req.user.id;
    const isPlayer = payment.booking.playerId === req.user.id;
    if (!isOwner && !isPlayer) return res.status(403).json({ message: 'Access denied' });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payments/:id/submit-receipt — player submits receipt image URL
export const submitReceipt = async (req, res) => {
  try {
    const { receiptImageUrl } = req.body;

    if (!receiptImageUrl) {
      return res.status(400).json({ message: 'Receipt image URL is required' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: true },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking.playerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (payment.status === 'PAID') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        receiptImageUrl,
        status: 'RECEIPT_SUBMITTED',
        playerSubmittedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payments/:id/confirm — owner confirms payment after reviewing receipt
export const confirmPayment = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: { include: { stadium: true } } },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }
    if (payment.status !== 'RECEIPT_SUBMITTED') {
      return res.status(400).json({ message: 'No receipt submitted yet' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: req.params.id },
        data: {
          status: 'PAID',
          ownerConfirmedAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      return p;
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payments/:id/reject — owner rejects receipt with a reason
export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: { include: { stadium: true } } },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }
    if (payment.status !== 'RECEIPT_SUBMITTED') {
      return res.status(400).json({ message: 'No receipt submitted to reject' });
    }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        ownerRejectedAt: new Date(),
        ownerRejectionReason: reason || 'Receipt rejected by owner',
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payments/:id/dispute — player disputes a rejection
export const disputePayment = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: true },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.booking.playerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (payment.status !== 'REJECTED') {
      return res.status(400).json({ message: 'Can only dispute rejected payments' });
    }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status: 'DISPUTED',
        isDisputed: true,
        disputeReason: reason || 'Player disputes rejection',
        disputedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
