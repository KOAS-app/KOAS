KOAS 7-Day Execution Plan
A week is aggressive but still possible for an MVP IF:
    • you stay disciplined
    • cut nonessential features
    • avoid perfectionism
    • reuse components aggressively
    • build backend-first
If you try to make it “production-perfect” in 7 days, you’ll fail.
Your goal is:
Functional MVP
NOT:
enterprise sports ecosystem

What You MUST Cut
Do NOT build this now:
    • tournaments
    • rankings
    • social feeds
    • live chat
    • advanced analytics
    • fancy animations
    • complex notifications
    • AI recommendations
    • realtime sockets
Those are distractions.

MVP Scope (ONLY)
Owner Web App
    • login/register
    • add stadium
    • upload images
    • create schedules
    • manage bookings
    • revenue summary
Admin Dashboard
    • login
    • approve stadiums
    • manage users
    • monitor bookings
Player Mobile App
    • auth
    • browse stadiums
    • view details
    • booking
    • payment placeholder/manual
    • booking history
Backend
    • authentication
    • stadium CRUD
    • booking engine
    • slot generation
    • role system
That’s it.

Recommended Stack
Backend
    • Node.js
    • Express.js
    • PostgreSQL
    • Prisma ORM

Web Apps
    • React
    • Vite
    • Tailwind CSS

Mobile App
    • React Native
    • Expo

PROJECT STRUCTURE
Do NOT create separate repos.
Use monorepo style:
/koas
   /backend
   /owner-web
   /admin-web
   /mobile-app
This saves time massively.

DAY-BY-DAY EXECUTION PLAN
DAY 1 — FOUNDATION + BACKEND CORE
Objective
Build the entire backend skeleton.

Tasks
Backend Setup
    • Express setup
    • PostgreSQL connection
    • Prisma setup
    • Environment variables
    • Folder structure

Database Models
Build:
    • users
    • stadiums
    • bookings
    • slots
    • payments

Authentication
Implement:
    • JWT auth
    • register/login
    • role middleware
Roles:
    • owner
    • admin
    • player

Create API Structure
Routes:
/auth
/stadiums
/bookings
/admin

End of Day Goal
You should have:
    • working API
    • auth
    • database connected
    • role protection working

DAY 2 — OWNER WEB APP
Objective
Finish owner dashboard core functionality.

Pages
Auth
    • login
    • register
Dashboard
    • stadium list
    • booking stats
Stadium Management
    • create stadium
    • edit stadium
    • upload images
Schedule Management
    • create slots
    • pricing
Booking Management
    • accept/reject bookings

IMPORTANT
Do NOT obsess over design.
Functional > pretty.

End of Day Goal
Owner can:
    • create stadium
    • manage bookings
    • manage schedule

DAY 3 — ADMIN DASHBOARD
Objective
Finish admin management panel.

Pages
Login
Dashboard
    • total users
    • total bookings
    • pending approvals
Stadium Approval
    • approve/reject stadium
User Management
    • list users
    • suspend users
Booking Monitoring

Shared Components
Reuse:
    • tables
    • cards
    • forms
    • modals
between admin and owner apps.
Huge time saver.

End of Day Goal
Admin fully operational.

DAY 4 — BOOKING ENGINE
Objective
Build the MOST IMPORTANT PART.

Tasks
Slot Generation
Auto-create hourly slots.

Booking Validation
Prevent:
    • duplicate booking
    • overlapping booking

Booking Transactions
Use database transactions.
Critical.

Payment Placeholder
Initially:
Cash/manual payment
You can integrate Telebirr later.
Do NOT waste 2 days fighting payment APIs.

End of Day Goal
Complete booking flow works.

DAY 5 — PLAYER MOBILE APP
Objective
Build player-facing experience FAST.

Screens
Auth
    • login/register
Home
    • turf listing
Turf Details
    • images
    • pricing
    • availability
Booking
    • select slot
    • confirm booking
Booking History

DO NOT
    • build fancy animations
    • build offline mode
    • overcomplicate navigation

End of Day Goal
Player can book turf.

DAY 6 — INTEGRATION + TESTING
Objective
Fix everything.

Tasks
API Integration
Connect:
    • mobile
    • owner
    • admin

Fix Bugs
You WILL have:
    • auth bugs
    • CORS bugs
    • date/time bugs
    • booking conflicts
This day is critical.

Security Checks
    • route protection
    • validation
    • role checks

UI Cleanup
Only now polish UI slightly.

DAY 7 — DEPLOYMENT + DEMO PREP
Objective
Deploy stable MVP.

Deployment
Backend
    • VPS preferred
OR
    • cPanel Node.js hosting

Frontend
Deploy:
    • owner dashboard
    • admin dashboard
to cPanel.

Mobile
Build APK using Expo.
You do NOT need App Store submission immediately.

FINAL DEMO CHECKLIST
Owner
    • create stadium
    • manage schedule
    • view bookings
Admin
    • approve stadium
    • manage users
Player
    • browse turf
    • book slot
Backend
    • auth works
    • booking conflict prevention works

CRITICAL ENGINEERING ADVICE
1. Do NOT Waste Time On UI
Ugly but functional beats beautiful but unfinished.

2. Booking Logic Is Priority #1
Broken booking system = dead platform.

3. Hardcode Some Things Initially
Example:
    • payment statuses
    • notification templates
You can improve later.

4. Avoid Premature Architecture
Do NOT add:
    • microservices
    • Redis
    • Kafka
    • Docker Swarm
    • GraphQL
You are building an MVP, not Netflix.

Minimum Viable Success
By end of week:
    • owner can manage stadium
    • admin can approve
    • player can book
If those 3 work reliably:
you succeeded.
