# Mom's Magic (Restaurant) - Full-Stack Next.js App

A full-stack restaurant website and admin dashboard built with Next.js App Router. It includes menu/deals/story pages, table reservations backed by MongoDB, media uploads via Cloudinary, and a payment-order endpoint for Razorpay (demo-friendly, guarded when not configured).

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, GSAP, Lucide Icons
- Backend: Next.js Route Handlers (API), MongoDB, Mongoose
- Integrations: Cloudinary (uploads), Razorpay (order creation)

## Key Features

- Public site pages: Home, Menu, Deals, Story, Reservation
- Reservation workflow: offer selection, advance amount calculation, confirmation screen
- Admin dashboard: manage menu, deals, testimonials, team, story, reservations, and admin profile
- 3D UI polish: Framer Motion tilt interactions + parallax/scroll background effects

## Project Structure

- `src/app/(public)`: public pages + public layout
- `src/app/admin`: admin pages
- `src/app/api/*`: backend endpoints (menu, deals, reservations, uploads, seed, admin stats/profile)
- `src/models/index.ts`: Mongoose schemas (Category, MenuItem, Deal, Reservation, Offer, Testimonial, Story, Employee, Admin)
- `src/components/*`: UI, layout, and admin panels

## Local Setup

### 1) Install

```bash
npm install
```

### 2) Environment Variables

Copy the example and fill your own values:

```bash
cp .env.example .env
```

Required:

- `MONGODB_URI`

Optional (feature-gated):

- `CLOUDINARY_URL` (for `/api/upload`)
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (for `/api/razorpay`)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (for client-side checkout UI)
- `ADMIN_SESSION_SECRET` (required to sign admin sessions)
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` (optional first-run admin bootstrap for `/admin/login`)
- `ADMIN_BOOTSTRAP_KEY` (optional one-time bootstrap via `POST /api/admin/bootstrap`)
- `SEED_KEY` (optional; allow `GET /api/seed` with header `x-seed-key`)

### 3) Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seeding Demo Data

This endpoint clears and repopulates collections (categories, menu, offers, deals, testimonials, story):

- `GET /api/seed`

Use it only in development.

## API Notes

- `POST /api/reservation` computes `totalAmount` on the server using the selected offer and seat count (fallbacks allowed for demos).
- `POST /api/razorpay` returns `503` when Razorpay env vars are missing (so the app doesn't crash in demo mode).
- Admin pages under `/admin/dashboard` require a signed httpOnly cookie session created by `POST /api/admin/login`.
- `POST /api/razorpay/webhook` verifies Razorpay webhook signatures and marks reservations as `paid`/`failed` based on payment events.
- `POST /api/reservation` enforces time-slot capacity using `RESERVATION_SLOT_MINUTES` and `RESERVATION_MAX_SEATS_PER_SLOT`.

## Suggested Improvements (Roadmap Ideas)

- Replace simulated admin login with real auth (JWT/session + password hashing).
- Add Razorpay Checkout + webhook verification to mark reservations as `paid` securely.
- Add inventory/availability (sold out items, time-based availability, kitchen capacity).
- Add search + filters (veg/non-veg, category, spice level, allergens).
- Add analytics: popular items, conversion rate, reservation volume by slot, revenue by offer.
- Add automated emails/SMS for booking confirmation and reminders.
