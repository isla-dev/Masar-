# MASAR+ — Phase 1 Scaffold

Foundation for the LMS: monorepo with `server/` (Node.js + Express + TypeScript +
raw SQL via `pg`) and `client/` (React + Vite + TypeScript + Tailwind CSS + i18next).

## What's included in this phase

- Full PostgreSQL schema as versioned SQL migrations (`node-pg-migrate`), covering
  users, courses, sections, lectures, quizzes, assignments, enrollments, progress,
  certificates, payments, reviews, notifications, and a generic `translations`
  table for admin-editable content translations.
- Express app with security middleware (helmet, cors), centralized error handling,
  Zod request validation, and a feature-module folder structure.
- JWT auth (short-lived access token + httpOnly-cookie refresh token), bcrypt
  password hashing, and role-based middleware — fully wired for `auth`
  (register/login/refresh/logout) as the reference pattern for every other module.
- React app with routing, `ProtectedRoute`/`RoleRoute` guards, `AuthContext` with
  silent token refresh, an axios client with automatic 401-retry-after-refresh,
  and i18next configured for `en`/`fr`/`ar` with automatic `dir="rtl"` switching.

## Getting started

### 1. Database
```bash
docker compose up -d          # starts Postgres on localhost:5432
cd server
cp .env.example .env          # adjust if you're not using the docker-compose defaults
npm install
npm run migrate:up
```

### 2. Server
```bash
cd server
npm run dev                   # http://localhost:5000
```

### 3. Client
```bash
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

## Notes on decisions made in this scaffold

- **Content translations**: modeled as a generic `translations` table
  (`entity_type`, `entity_id`, `field_name`, `language`, `value`) rather than
  `jsonb` columns on each table, since the admin needs to manage translations
  directly (per the spec). This costs an extra join when reading translated
  content but keeps translation management uniform across entity types. Flag
  if you'd prefer the `jsonb` approach instead — it's a straightforward swap
  at this stage.
- **Tailwind color palette** in `client/tailwind.config.js` is a placeholder
  (`primary` = pink/rose scale) — worth a proper design pass before Phase 3.
- Only the `auth` module is implemented end-to-end; every other module folder
  under `server/src/modules/` is scaffolded but empty, to be filled in phase
  by phase per the roadmap.

## Next step

All 11 phases from the original roadmap are now done:
- Phase 1: foundation (schema, auth, i18n/RTL)
- Phase 3: public course catalog
- Phase 4: teacher course management (courses/sections/lectures, uploads)
- Phase 5: student learning flow (enrollment, course player, progress)
- Phase 6: quizzes & assignments
- Phase 7: certificates (auto-generated PDF, verification page)
- Phase 8: **payments — CIB & Edahabia in DZD, via Chargily Pay**
- Phase 9: dashboards (profile, teacher overview, student results/activity)
- Phase 10: admin module (course approval, users, categories, certificates)

### Phase 8 — how payments work

Neither Stripe nor PayPal support Algeria, so the two real options for
CIB/Edahabia are (a) integrating SATIM's raw gateway directly, which
requires a merchant agreement with an Algerian bank and credentials issued
through CIBWeb.dz, with an undocumented signature scheme you'd have to
reverse-engineer from community packages, or (b) **Chargily Pay**, an
Algerian fintech aggregator with an official, actively-maintained SDK
(`@chargily/chargily-pay`) that processes both EDAHABIA (Algérie Poste) and
CIB (via SATIM) through one documented, DZD-native API. This scaffold uses
Chargily Pay — it's the only option of the two you can actually get working
correctly without a bank merchant contract and internal SATIM
documentation neither of us has.

**How the flow works:**
1. Student picks "Pay with CIB" or "Pay with Edahabia" on a paid course →
   `POST /api/courses/:id/checkout` creates a `pending` row in the
   `payments` table and asks Chargily for a hosted checkout page.
2. The student is redirected to Chargily's page, enters their card details
   there (never on our servers — we never see card numbers).
3. Chargily redirects back to `/payment/result`, which polls the course
   detail endpoint for up to ~20s waiting for the enrollment to appear.
4. **The enrollment is only ever created by the webhook**
   (`POST /api/payments/webhook/chargily`), never by the redirect — the
   redirect is not proof of payment and is never trusted for that. The
   webhook's signature is verified against the exact raw request bytes
   before anything happens.

**To actually test this locally**, you need:
- A free Chargily Pay test account → API key from
  https://pay.chargily.com/test/dashboard/developers-corner
- `CHARGILY_API_KEY` and `CHARGILY_MODE=test` set in `server/.env`
- Since Chargily calls your webhook server-to-server, `localhost` isn't
  reachable from the internet — use `ngrok http 5000` (or similar) and
  paste the resulting public URL + `/api/payments/webhook/chargily` into
  the webhook endpoint field in that same Chargily dashboard.
- Without this set up, checkout still creates the Chargily session and
  redirects fine, but the payment will never be confirmed on our side since
  the webhook can't reach your machine — `/payment/result` will just show
  the "still confirming" timeout state. That's expected in that case, not a
  bug.

**Not built in this phase:** refunds, and an admin-facing payments/
transactions list (the `payments` table has everything needed for one — a
future admin page would just query it — but no UI exists for it yet).