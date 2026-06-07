# Intelbase SaaS - Design Spec

> Date: 2026-06-07
> Status: Proposed - awaiting approval before code
> Turns the Intelbase command plane (cinematic, simulated) into a real subscription web SaaS.

## 1. Product

Intelbase is a subscription web app: an AI operating system that runs a business's front
office and growth. The funnel: **clean landing -> subscribe (Stripe) -> sign in -> onboard
(connect your tools) -> the command-plane dashboard runs it for you.** The cinematic command
plane (Agents constellation, Memory Cortex, Deck, Team, Usage, Settings) is the logged-in
PRODUCT, seeded per account. Automation is simulated/seeded for now; real integrations get
wired in over time (the SaaS shell is real: real auth, real billing, real accounts).

## 2. Locked decisions

- Scope: **Full SaaS shell** (real landing + Stripe + accounts + onboarding + per-account
  dashboard; automation simulated for now).
- Auth + data: **Supabase** (Postgres + Auth). Sign-in: **Google OAuth + email & password**.
- Billing: **Stripe**, tiers **Starter / Growth / Scale**, **USD $99 / $299 / $799 / mo**,
  annual (~2 months free), **14-day free trial**. Checkout + Customer Portal + webhooks.
- Landing: **new clean SaaS landing REPLACES the current homepage**; command plane moves
  behind auth as the app.
- Access: **everything is behind login** (no public demo). Marketing sells it; you must sign
  up (trial) to see the app.
- Per the project press-go rule: **I build all code + schema + wiring, and HAND BACK anything
  that costs money or needs a credential** (create Supabase project + run migrations, create
  Stripe products/prices + webhook, set env vars, deploy). I do not provision or spend.

## 3. Architecture

- **Public (no auth):** `/` clean SaaS landing, `/pricing` (or pricing section + page),
  `/login`, `/signup`, legal pages. Marketing CTAs -> signup -> trial.
- **Auth:** Supabase Auth (Google + email/password) via `@supabase/ssr` (cookie sessions,
  middleware-protected app routes). `profiles` row per user.
- **Data (Supabase Postgres):** `profiles`, `organizations` (a user's business/workspace),
  `subscriptions` (Stripe customer/sub id, plan, status, trial_end), `connections`
  (integration -> connected bool/state), and seed data for the dashboard per org.
- **Billing (Stripe):** 3 products x (monthly, annual) prices. `/api/checkout` creates a
  Checkout Session (trial). `/api/portal` opens the Customer Portal. `/api/stripe/webhook`
  syncs subscription status into `subscriptions`. Access gating reads subscription/trial
  status.
- **App (auth + active trial/subscription required):** `/app` = the command plane dashboard,
  per-account. Middleware redirects: not signed in -> `/login`; signed in but no active
  trial/sub -> `/pricing` (or checkout). Settings tab gains Account + Billing (manage via
  Portal).
- **Onboarding:** first login -> `/onboarding` wizard: name your business, **connect your
  tools** (full grid: Website chat, WhatsApp, Email/Inbox, Meta Ads, Calendar/Booking, CRM -
  simulated connect for now), set goals -> seeds the org's dashboard so it is alive
  immediately with their business name.

## 4. Tech + constraints

- Next.js 16.2.2 fork (App Router). RE-CHECK fork docs in `node_modules/next/dist/docs/` for
  Route Handlers, Middleware, and Server Actions conventions before writing them.
- New deps (leaf, standard): `@supabase/supabase-js`, `@supabase/ssr`, `stripe`. `resend`
  already installed (transactional email). Flag: fork is sensitive to reinstalls; add
  carefully and verify build.
- The existing cinematic command plane code under `src/components/command/` + `src/lib/command/`
  is REUSED as the app dashboard; it gets parameterized by the signed-in org (seed the sim
  with the org name + saved connections).
- Old marketing components + `/os` demo: set aside (not linked). `/command` becomes gated
  `/app` (or `/app` mounts the command plane).
- No em dashes in on-screen copy. Secrets via env (`.env.local`, documented in HANDBACK).

## 5. Landing page (new homepage)

Clean, modern SaaS landing (dark, premium, matches the Intelbase neon identity): hero with a
sharp value prop ("An AI operating system that runs your business. Connect everything. It runs
the rest.") + primary CTA "Start free trial"; a short "how it works" (Subscribe -> Connect ->
It runs your front office); a feature/section showcase (the agents, the memory cortex, lead
gen, ads, follow-ups) ideally teased with stills/loops of the real dashboard; a pricing
section (3 tiers, monthly/annual toggle, trial CTA); social proof / FAQ; footer. All CTAs lead
to signup/trial.

## 6. Build phases

1. **Phase A - Landing + pricing** (no secrets needed): new homepage + pricing UI + signup/
   login pages (UI), CTAs wired to the (stubbed) auth/checkout entry points. Immediate
   visible win.
2. **Phase B - Auth + DB**: Supabase client/server setup, Google + email/password, middleware
   route protection, `profiles`/`organizations` schema + RLS, signup/login functional.
3. **Phase C - Stripe billing**: products/prices config, Checkout (trial), webhook -> sync
   `subscriptions`, Customer Portal, access gating by trial/sub status.
4. **Phase D - Onboarding**: wizard (business name, connect grid simulated, goals) -> seeds
   org dashboard data.
5. **Phase E - Gated app**: `/app` command plane per-account (seeded), Settings -> Account +
   Billing, sign-out.

Phases B-D need the user's Supabase + Stripe accounts/keys; I build the code and hand back the
provisioning/env/deploy steps. Phase A needs nothing and ships first.

## 7. Success criteria

- New landing replaces the homepage and drives to a free-trial signup.
- A visitor can sign up (Google or email/password), start a 14-day trial via Stripe, land in
  onboarding, connect tools (simulated), and reach their own seeded command-plane dashboard.
- Subscription/trial status gates app access; billing is manageable via the Stripe portal;
  webhooks keep status in sync.
- Build passes; no money spent or services provisioned by me (all such steps in HANDBACK).

## 8. Open choices (defaulted; say to change)

- App route `/app` (vs keeping `/command`). Tier feature lists (what each plan includes) - I
  will draft sensible ones. Exact landing copy/sections - I will draft, you edit.
