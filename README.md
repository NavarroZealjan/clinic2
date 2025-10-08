##
This repo is a minimal example implementing role-based authentication/authorization
for a clinic app (doctors, secretaries, admin). It uses Next.js App Router, PostgreSQL,
JWT stored in an httpOnly cookie, and server-side protection for API routes.

## Quick setup (local)
1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the database and run the SQL in `db/schema.sql`.
4. Seed an admin:
   - Option A: edit `.env.local` and add `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD`, then:
     ```
     npm run seed-admin
     ```
   - Option B: run (POSIX):
     ```
     SEED_ADMIN_USERNAME=admin SEED_ADMIN_PASSWORD=AdminPassword123 npm run seed-admin
     ```
5. Start dev server:
   ```
   npm run dev
   ```
6. Open `http://localhost:3000/login` and sign in with the seeded admin credentials.

## What is included
- `app/` — Next.js App Router pages & API routes (`/api/login`, `/api/logout`, `/api/me`, `/api/admin/create-doctor`)
- `lib/` — helpers for DB, auth, middleware
- `scripts/seed-admin.js` — convenience script to create initial admin
- `db/schema.sql` — database schema (users, patients, appointments)

## Notes
- Update `JWT_SECRET` to a secure random string in production.
- This is a minimal example — extend error handling, logging, and production cookie options as needed.
