import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes    from './routes/auth.routes.js';
import stadiumRoutes from './routes/stadium.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import slotRoutes    from './routes/slot.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes  from './routes/review.routes.js';
import uploadRoutes  from './routes/upload.routes.js';
import bankAccountRoutes from './routes/bankAccount.routes.js';
import subscriptionPlanRoutes from './routes/subscriptionPlan.routes.js';
import playerSubscriptionRoutes from './routes/playerSubscription.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded from different origins
}));

// ── CORS — allow all origins in dev
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// ── Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Routes
app.use('/api/auth',     authRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/slots',    slotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/player-subscriptions', playerSubscriptionRoutes);

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
