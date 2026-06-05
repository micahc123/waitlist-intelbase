# intelbase OS — Consolidated "Press Go" Hand-back

> Everything that costs money, needs a credential, or pushes something live across all four
> workstreams. **Nothing in this list was executed for you** (HAND-02) — no tool was bought, no ad
> spend pushed, no live deploy run, no email sent. Work through it top to bottom when you're ready.
> Built 2026-06-05.

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
