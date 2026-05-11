import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import stadiumRoutes from './routes/stadium.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import slotRoutes from './routes/slot.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'KOAS API Running' });
});

export default app;
