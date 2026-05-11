import prisma from '../config/prisma.js';

// GET /api/payments/booking/:bookingId — get payment for a booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: req.params.bookingId },
      include: {
        booking: {
          include: {
            stadium: true,
            slot: true,
          },
        },
      },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Only the booking's stadium owner or the player can view
    const isOwner = payment.booking.stadium.ownerId === req.user.id;
    const isPlayer = payment.booking.playerId === req.user.id;
    if (!isOwner && !isPlayer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/payments/:id/mark-paid — owner marks payment as paid (cash collected)
export const markAsPaid = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: { include: { stadium: true } } },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.booking.stadium.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not your stadium' });
    }

    if (payment.status === 'PAID') {
      return res.status(400).json({ message: 'Payment already marked as paid' });
    }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: 'PAID' },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
