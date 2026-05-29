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

// ── CORS — restrict origins in production, allow all in dev
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
};

app.use(cors(corsOptions));

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
