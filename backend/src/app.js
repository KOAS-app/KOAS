import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes    from './routes/auth.routes.js';
import stadiumRoutes from './routes/stadium.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import slotRoutes    from './routes/slot.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — allow all origins in dev
app.use(cors());

// ── Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// ── Routes
app.use('/api/auth',     authRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/slots',    slotRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (_req, res) => res.json({ message: 'KOAS API Running' }));

// ── 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});

export default app;
