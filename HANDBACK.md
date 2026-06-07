# intelbase OS — Consolidated "Press Go" Hand-back

> Everything that costs money, needs a credential, or pushes something live across all four
> workstreams. **Nothing in this list was executed for you** (HAND-02) — no tool was bought, no ad
> spend pushed, no live deploy run, no email sent. Work through it top to bottom when you're ready.
> Built 2026-06-05.

---

# Intelbase SaaS — Press Go (added 2026-06-07)

> The site is now a subscription web SaaS: clean landing -> Stripe trial -> Supabase login ->
> onboarding (connect tools) -> the per-account command-plane dashboard at `/app`. All the
> CODE is built and the production build passes. Nothing below was provisioned or paid for by
> me. Until you set the env vars, the app runs in a resilient demo mode: the public site and a
> default `/app` workspace render, but auth/billing are inert.

### A. Local verify (done, re-check anytime)
- [x] `npm install` ran (added `@supabase/supabase-js`, `@supabase/ssr`, `stripe`).
- [x] `npm run build` passes. Routes: `/` (landing), `/pricing`, `/login`, `/signup`,
  `/onboarding`, `/app` (gated command plane), `/api/billing/checkout`, `/api/billing/portal`,
  `/api/stripe/webhook`. `/command` now redirects to `/app`.

### B. Supabase (auth + database) — free tier is fine to start
1. [ ] Create a Supabase project. Copy: Project URL, `anon` key, `service_role` key.
2. [ ] In the SQL editor, run `supabase/schema.sql` (creates profiles, organizations,
   subscriptions, connections + RLS + the new-user trigger).
3. [ ] Auth -> Providers: enable Email, and enable Google (create a Google OAuth client; set
   the Google authorized redirect to the Supabase callback shown in that panel).
4. [ ] Auth -> URL config: add your site URL and `…/auth/callback` as a redirect URL.

### C. Stripe (billing) — test mode first
1. [ ] Create 3 products with recurring prices (USD): Starter $99/mo, Growth $299/mo,
   Scale $799/mo, and an annual price for each (annual = monthly x10, i.e. $990 / $2,990 /
   $7,990). Copy the 6 Price IDs.
2. [ ] Get your `STRIPE_SECRET_KEY` (test mode to start).
3. [ ] Create a webhook endpoint -> URL `https://<your-domain>/api/stripe/webhook`, events:
   `checkout.session.completed`, `customer.subscription.created/updated/deleted`. Copy the
   signing secret -> `STRIPE_WEBHOOK_SECRET`. (For local testing use `stripe listen
   --forward-to localhost:3000/api/stripe/webhook`.)
4. [ ] Settings -> Billing -> Customer Portal: activate it (so "Manage billing" works).

### D. Env vars (`.env.local`, and in your host) — see `.env.example`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_STARTER_MONTHLY/ANNUAL`, `…GROWTH…`, `…SCALE…` (the 6 Price IDs)
- [ ] `NEXT_PUBLIC_APP_URL` (e.g. `https://intelbase.studio`)
- [ ] (Existing keys still apply if you use them: `ANTHROPIC_API_KEY`, etc.)

### E. Deploy + smoke test
1. [ ] Deploy (Vercel etc.) with all env vars set; point the Stripe webhook at the prod URL;
   set `NEXT_PUBLIC_APP_URL` to prod.
2. [ ] Smoke test: sign up (Google or email) -> onboarding -> pick a plan -> Stripe Checkout
   (use a test card `4242 4242 4242 4242`) -> lands on `/app` with your workspace -> Settings
   shows your email + "Manage billing" opens the portal -> the `subscriptions` row populated
   by the webhook.

### Notes / not-yet-real
- The dashboard automation is SIMULATED (seeded per account). The "connect your tools" grid
  marks connections as connected but does not yet call the real WhatsApp/Meta/Calendar APIs;
  wiring those is the next milestone.
- No money spent and nothing provisioned by me: creating the Supabase/Stripe accounts, keys,
  webhook, and deploy are all yours.

---

# Intelbase Real Engine — Press Go (added 2026-06-07)

> The agents, integrations, and memory are now REAL in code: Claude (Vercel AI SDK) agents that
> call your connected apps via Composio and use Supabase pgvector memory, with a triggers
> webhook so agents act on inbound events. It all builds and runs today in SIMULATED mode (no
> keys = graceful offline replies + demo data). Add the keys below to switch it live. Spec:
> `docs/superpowers/specs/2026-06-07-intelbase-real-engine-design.md`.

### A. Done / verified
- [x] Installed `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/react`, `@composio/core`,
  `@composio/vercel`. Build passes. The live chat route returns the offline reply until keys
  are set (confirmed).

### B. Anthropic (agent brain)
1. [ ] Set `ANTHROPIC_API_KEY`. Agents use `claude-opus-4-6` (reasoning) / `claude-sonnet-4-6`
   (lighter). Cost: pay-as-you-go Anthropic usage.

### C. Composio (real integrations + OAuth + triggers)
1. [ ] Create a Composio account; set `COMPOSIO_API_KEY`.
2. [ ] In Composio, enable the toolkits you want (Gmail, Google Calendar, Slack, HubSpot,
   Notion, Google Sheets work immediately; WhatsApp + Meta Ads need Meta verification first)
   and configure each toolkit's OAuth (auth config). Point the post-OAuth redirect at
   `${APP_URL}/api/integrations/callback?toolkit=<slug>` (the SDK has no per-call redirect; the
   helper `callbackUrl(slug)` in `src/lib/integrations/composio.ts` generates these).
3. [ ] Set up a Composio Trigger (e.g. Gmail new-message) to POST to
   `${APP_URL}/api/composio/webhook`; set `COMPOSIO_WEBHOOK_SECRET` and add it to env for
   signature verification. New email -> Inbox agent; calendar event -> Scheduler; else -> Ops.

### D. Embeddings + memory (Supabase pgvector)
1. [ ] Set `OPENAI_API_KEY` (embeddings via `text-embedding-3-small`; swappable to Voyage/Cohere
   if you prefer, by editing `src/lib/memory/embeddings.ts`).
2. [ ] In Supabase: run `supabase/memory.sql` (enables the `vector` extension, creates the
   `memories` table + RLS + the `match_memories` function). Requires `supabase/schema.sql` to
   have been run first (it defines `organizations` + `is_org_owner`).

### E. What goes live when configured
- "Connect your tools" (onboarding + Settings) does REAL OAuth via Composio (falls back to the
  simulated toggle when `COMPOSIO_API_KEY` is unset).
- Clicking an agent node in `/app` opens a real streamed chat; the agent answers with Claude,
  can call the org's connected tools (e.g. read calendar, draft email), and the conversation is
  stored in pgvector memory and recalled later.
- The Memory Cortex shows real stored memories once they exist (badge flips to "live memory");
  otherwise it shows demo data.
- Composio triggers fire agents autonomously on inbound events.

### F. Honest gaps
- WhatsApp + Meta Ads connect but go live only after Meta business verification + app review.
- The constellation counters / live feed remain partly seeded; they reflect real memory where
  available but are not yet a full real-time event store.

---

## 0. Verify the website build first (blocks everything that deploys)
- [ ] `npm install` then `npm run build` in this repo. I could **not** run it (no `node_modules`, and your Next.js is a modified fork I won't reinstall blindly).
- [ ] If it errors, send me the output. Pay special attention to the four files marked `// VERIFY AGAINST FORK` (the agent's API routes + dashboard page) — their route-handler signatures must match your fork's `node_modules/next/dist/docs/`.

## 1. Demo AI-OS agent — go live (Phase 3)
Files: `src/lib/agent/`, `src/app/api/agent/`, `src/app/api/leads/`, `src/app/dashboard/`, `src/components/chat-widget.tsx`. See `src/lib/agent/README.md`.
- [ ] **`ANTHROPIC_API_KEY`** — set as a deploy secret (required; the client throws without it). Cost: Anthropic API usage (pay-as-you-go).
- [ ] **`ANTHROPIC_MODEL`** — optional, defaults to `claude-opus-4-8`.
- [ ] **`BOOKING_URL`** — your Cal.com (or other) booking link; defaults to the site's existing cal.com link.
- [ ] **Lead storage for production** — the default file store is **ephemeral on serverless (Vercel/Netlify) and will look empty**. For a real deploy set `LEAD_STORE=kv`, add a KV dep (`@vercel/kv` or `@upstash/redis`), provision it, set `KV_REST_API_URL` / `KV_REST_API_TOKEN`, and implement the `KVLeadStore` stub in `src/lib/agent/storage.ts` (it throws on purpose until you do).
- [ ] **Auth-gate `/dashboard` and `/api/leads`** before exposing publicly (currently open so local dogfood works).
- [ ] Deploy. Confirm the chat widget answers on the live site and a test conversation shows up on `/dashboard`.

## 2. Ads — redeploy (Phase 4)  ·  separate repo `~/Developer/adsmanager`
Full steps: `~/Developer/adsmanager/docs/REDEPLOY_CHECKLIST.md`.
- [ ] **Note:** that folder is **not a git repo** — the new copy/creatives are on disk but unversioned. Run `git init` there (or tell me to) if you want history.
- [ ] The 12 `creatives/output/*.png` are freshly re-rendered. The 3 standalone `ad-creatives/v{1,2,4}.png` are **stale** (no auto-renderer) — re-export manually or drop them (the 12 cover every pillar/ratio).
- [ ] Put your **Meta/Pipeboard token** in `~/Developer/adsmanager/.mcp.json`; have ad account / page / pixel / conversion IDs ready.
- [ ] Follow the checklist: steps create everything **PAUSED** → you review in Ads Manager → **you** flip to ACTIVE (the only spend moment). **Nothing is live until you do this.**

## 3. Outbound lead-gen — switch on (Phase 5)  ·  budget ≤10k HKD/mo
Full detail: `lead-gen/RUNBOOK.md` (PRESS GO section). Launch config ~1.4k HKD/mo; scaled ~5k HKD/mo — both well under ceiling. Costs are list-price estimates; confirm at purchase. **Earliest first send ≈ 3-4 weeks out (mostly inbox warmup).**
1. [ ] Register **3-5 secondary domains** (never send from the primary). ~US$30-60/yr.
2. [ ] Buy **9-15 inboxes** (Google Workspace, ~3/domain). ~US$45-90/mo.
3. [ ] Configure **SPF/DKIM/DMARC/MX + tracking domain** on every domain; verify.
4. [ ] Buy + configure **sending tool** (Smartlead/Instantly), connect inboxes, **start warmup now** (3+ weeks), import `lead-gen/SEQUENCES/sequences.json`. ~US$39-94/mo.
5. [ ] Buy **Apollo**, recreate Saved Searches A/B/C (`lead-gen/ICP_AND_APOLLO_SEARCH.md`), set Email Status = Verified. ~US$49-99/mo.
6. [ ] Buy **email verification** credits (MillionVerifier/NeverBounce). ~US$30-50/mo.
7. [ ] Set up **Cal.com + CRM**; point the website Book-a-call CTA **and** the Phase 3 agent's booking action at the **same** link so it's one funnel. US$0-50/mo.
8. [ ] *(Optional, once email loop is proven)* Add **Clay** (~US$149/mo) and/or **LinkedIn** (HeyReach ~US$99/mo).

**Do not cold-send** until warmup has run 3+ weeks, DNS verifies, and your first list passes two-pass verification.

## 4. Lead engine expansion (Phase 6)
Code: `src/app/api/{whatsapp,try-it,audit}/`, `src/components/{try-it,readiness-audit}.tsx`, `/audit` page. Playbooks: `lead-gen/systems/`. Full detail: `src/lib/agent/LEAD_SYSTEMS.md` + `lead-gen/systems/README.md`. Build + typecheck pass.
- [ ] **WhatsApp concierge** — set `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`; register the number + get message templates approved in Meta; add `WHATSAPP_APP_SECRET` + HMAC signature check before public production.
- [ ] **Try-it demo + Readiness Audit** — both capture leads and currently say "we emailed you" but **no ESP is wired**. Either connect an ESP (Resend is already a dependency) or soften that copy before go-live. They reuse `ANTHROPIC_API_KEY`.
- [ ] **Retargeting (GROW-01)** — `ConciergeAbandoned` pixel event is live; add `ConciergeEngaged` / `ConciergeBooked` events too, then build Meta audiences (include abandoned, exclude booked).
- [ ] **Growth channels (buy warm + cheap first; keep total ≤10k HKD/mo):** Reactivation (~$0, your own list) → LinkedIn (HeyReach ~US$79/mo) → AI voice (Vapi/Bland, usage ~$0.05-0.15/min) → WhatsApp broadcast (BSP) → Meta retarget spend (~US$8-13/day) → Partner/referral (~$0). Per-system steps in each `lead-gen/systems/*.md`.
- [ ] **Production hardening** (from builder notes): try-it SSRF (block private IP ranges), WhatsApp signature verification, and the same hosted-lead-store requirement on serverless.

## Confirmation (HAND-02)
Across all phases I did not purchase any tool, start any warmup, upload any list, send any email, push any ad spend, or run any live deploy. Every such action is in this list for you to perform.
