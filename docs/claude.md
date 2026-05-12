# KOAS Architecture Documentation

## Project Overview

KOAS (King Of All Sports) is a stadium booking and management platform consisting of multiple integrated applications.

**Purpose**: Enable stadium owners to list and manage their facilities, admins to oversee the platform, and players to discover and book stadiums.

**MVPScope**: Functional core with essential features only—no tournaments, AI recommendations, real-time sockets, or advanced analytics.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KOAS Platform                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Player      │  │   Owner      │  │  Admin           │  │
│  │  Mobile App  │  │   Web App    │  │  Dashboard       │  │
│  │ (React       │  │ (React +     │  │ (React + Vite)   │  │
│  │  Native)     │  │  Vite)       │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                │                    │            │
│         └────────────────┼────────────────────┘            │
│                          │                                  │
│                  ┌───────▼────────┐                        │
│                  │  REST API      │                        │
│                  │  (Express.js)  │                        │
│                  └───────┬────────┘                        │
│                          │                                  │
│           ┌──────────────┼──────────────┐                  │
│           │              │              │                  │
│      ┌────▼────┐  ┌──────▼─────┐  ┌───▼─────┐            │
│      │ Auth    │  │ Stadium    │  │ Booking │            │
│      │ Service │  │ Service    │  │ Service │            │
│      └────┬────┘  └──────┬─────┘  └───┬─────┘            │
│           │              │            │                   │
│           └──────────────┼────────────┘                   │
│                          │                                │
│              ┌───────────▼──────────┐                     │
│              │  Prisma ORM          │                     │
│              │  (Data Access Layer) │                     │
│              └───────────┬──────────┘                     │
│                          │                                │
│              ┌───────────▼──────────┐                     │
│              │  PostgreSQL Database │                     │
│              └──────────────────────┘                     │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcrypt (via `hash.js`)

### Admin Web Application
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API (AuthContext)
- **HTTP Client**: Axios
- **Routing**: React Router (assumed from page structure)

### Owner Web Application
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API (AuthContext)
- **HTTP Client**: Axios
- **Routing**: React Router (assumed from page structure)

### Mobile App (Placeholder)
- **Framework**: React Native (planned)
- **Build Tool**: Expo (planned)

---

## Database Schema

### Core Entities

**Users**
```
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- role (ENUM: admin, owner, player)
- createdAt
- updatedAt
```

**Stadiums**
```
- id (PRIMARY KEY)
- ownerId (FOREIGN KEY → Users)
- name
- location
- description
- images[]
- status (ENUM: pending, approved, rejected)
- createdAt
- updatedAt
```

**Slots**
```
- id (PRIMARY KEY)
- stadiumId (FOREIGN KEY → Stadiums)
- startTime
- endTime
- price
- availability (ENUM: available, booked, maintenance)
- createdAt
- updatedAt
```

**Bookings**
```
- id (PRIMARY KEY)
- playerId (FOREIGN KEY → Users)
- slotId (FOREIGN KEY → Slots)
- status (ENUM: pending, confirmed, cancelled)
- totalAmount
- createdAt
- updatedAt
```

**Payments**
```
- id (PRIMARY KEY)
- bookingId (FOREIGN KEY → Bookings)
- amount
- status (ENUM: pending, completed, failed)
- method (ENUM: manual, card)
- createdAt
- updatedAt
```

---

## Backend Architecture

### Folder Structure
```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server startup
│   ├── config/
│   │   └── prisma.js       # Prisma client initialization
│   ├── controllers/        # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── stadium.controller.js
│   │   ├── booking.controller.js
│   │   ├── slot.controller.js
│   │   └── payment.controller.js
│   ├── middlewares/        # Express middlewares
│   │   └── auth.middleware.js
│   ├── routes/             # API route definitions
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── stadium.routes.js
│   │   ├── booking.routes.js
│   │   ├── slot.routes.js
│   │   └── payment.routes.js
│   ├── services/           # Business logic (optional)
│   └── utils/
│       ├── jwt.js          # JWT token generation/verification
│       └── hash.js         # Password hashing utilities
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   ├── seed.js             # Database seeding script
│   └── migrations/         # Database migrations
└── package.json
```

### Request Flow
```
Client Request
    ↓
Express Middleware (auth.middleware.js)
    ↓
Route Handler (routes/*.js)
    ↓
Controller (controllers/*.controller.js)
    ↓
Prisma ORM (config/prisma.js)
    ↓
PostgreSQL Database
```

### Authentication Flow
1. **Login**: Credentials sent to `POST /api/auth/login`
2. **Verification**: Credentials checked against hashed password in database
3. **JWT Generation**: `jwt.js` generates JWT token
4. **Token Storage**: Client stores token
5. **Protected Requests**: Token sent in `Authorization` header
6. **Validation**: `auth.middleware.js` validates token on protected routes

---

## Frontend Architecture

### Shared Patterns (Admin & Owner Web)

**Directory Structure**
```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components (route destinations)
├── layouts/            # Layout wrappers (DashboardLayout)
├── context/            # React Context (AuthContext)
├── api/                # API integration (axios setup)
├── types/              # TypeScript types and interfaces
├── utils/              # Helper functions (apiError handling)
├── assets/             # Static assets
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### State Management
- **AuthContext**: Manages user authentication state, login/logout operations, role-based access

### Routing
- **DashboardLayout**: Wraps authenticated routes, handles navigation
- **Pages**: Route destinations (LoginPage, DashboardPage, etc.)

### API Communication
- **axios.ts**: Configured Axios instance with base URL and interceptors
- **apiError.ts**: Centralized error handling utility

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration
- `POST /api/auth/logout` — User logout

### Stadium Management
- `GET /api/stadiums` — List all stadiums
- `GET /api/stadiums/:id` — Get stadium details
- `POST /api/stadiums` — Create stadium (owner only)
- `PUT /api/stadiums/:id` — Update stadium (owner)
- `DELETE /api/stadiums/:id` — Delete stadium (owner)

### Slot Management
- `GET /api/slots/:stadiumId` — Get slots for stadium
- `POST /api/slots` — Create slot (owner)
- `PUT /api/slots/:id` — Update slot availability
- `DELETE /api/slots/:id` — Cancel slot (owner)

### Booking Management
- `GET /api/bookings` — Get user's bookings
- `POST /api/bookings` — Create booking (player)
- `PUT /api/bookings/:id` — Update booking status
- `DELETE /api/bookings/:id` — Cancel booking

### Payment Management
- `GET /api/payments/:bookingId` — Get payment status
- `POST /api/payments` — Process payment

### Admin Operations
- `GET /api/admin/stadiums` — List pending stadiums (admin)
- `PUT /api/admin/stadiums/:id/approve` — Approve stadium (admin)
- `PUT /api/admin/stadiums/:id/reject` — Reject stadium (admin)
- `GET /api/admin/users` — List all users (admin)

---

## Security

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with signed tokens
- **Role-Based Access Control**: Routes protected by roles (admin, owner, player)
- **Password Hashing**: bcrypt for secure password storage
- **Middleware Protection**: `auth.middleware.js` validates requests

### Data Validation
- Inputs validated at route/controller level
- Prisma schema enforces data constraints

### Environment Variables
- Sensitive credentials stored in `.env` files (not in version control)
- Database connection strings, JWT secrets, API keys managed separately

---

## Deployment Considerations

### Current State
- Monorepo structure with independent build processes
- Frontend apps use Vite for fast builds
- Backend uses Node.js runtime

### Recommended Deployment
1. **Database**: PostgreSQL hosted on managed service (AWS RDS, Heroku Postgres, etc.)
2. **Backend**: Node.js server on cloud platform (Heroku, AWS EC2, Railway, etc.)
3. **Admin Web**: Static hosting (Vercel, Netlify, AWS S3 + CloudFront)
4. **Owner Web**: Static hosting (Vercel, Netlify, AWS S3 + CloudFront)
5. **Mobile App**: App stores or expo.dev deployment

### Environment Separation
- Development: Local PostgreSQL, local backend server
- Staging: Managed database, staging server
- Production: Managed database, production server with HTTPS

---

## Development Workflow

### Local Setup
1. Install dependencies: `npm install` in each folder
2. Configure `.env` files with database credentials
3. Run Prisma migrations: `npx prisma migrate dev`
4. Seed database: `node prisma/seed.js`
5. Start backend: `npm run dev` (backend)
6. Start frontend apps: `npm run dev` (admin-web, owner-web)

### Build & Deploy
1. Build backend: Production-ready Node.js app
2. Build web apps: `npm run build` generates optimized static files
3. Deploy to respective platforms

---

## Future Scalability

### Areas for Expansion
- **Microservices**: Split services (auth, booking, payment) into independent services
- **Caching**: Redis for session management and frequently accessed data
- **Message Queues**: RabbitMQ/Kafka for async operations (notifications, payments)
- **Real-time**: WebSockets for live slot availability updates
- **Analytics**: Separate analytics database for reporting
- **Search**: Elasticsearch for stadium discovery optimization

### Performance Optimization
- Database indexing on frequently queried fields
- API response pagination for large datasets
- Frontend code splitting and lazy loading
- CDN for static assets and images

---

## Monitoring & Logging

### Current Gaps (Future Improvements)
- Error tracking (Sentry recommended)
- Request logging (Winston, Pino)
- Performance monitoring (APM tools)
- User analytics (Google Analytics, Mixpanel)
- Uptime monitoring (Pingdom, UptimeRobot)

---

## Notes for Development

- **MVP Focus**: Avoid over-engineering; prioritize functionality
- **Code Reuse**: Maximize component reuse between admin and owner apps
- **Error Handling**: Centralized error handling in frontend and backend
- **Testing**: Add comprehensive test suites as MVP matures
- **Documentation**: Keep API documentation updated using Swagger/OpenAPI
