# Lead-generation systems (CODE-bearing) — hand-back

Four code-bearing lead-gen systems built on the existing framework-agnostic agent
core (`src/lib/agent/`). All of them reuse `runAgentTurn` / `generateText`,
guardrails, qualification, and the shared `LeadStore`, so every lead lands in the
same store and the same `/dashboard`. Nothing here was deployed, no external API
was called, no purchase or live send was made. Secrets are read from `process.env`
only, never hardcoded.

> House style: no em dashes anywhere. The Next.js surface is thin over the
> agnostic lib. See `channels.md` for the channel model and `README.md` for the
> base agent.

---

## 1. GROW-05 — WhatsApp Concierge (inbound webhook)

- **Route:** `src/app/api/whatsapp/route.ts` (thin; tagged `// VERIFY AGAINST FORK`).
- **What it does:** `GET` runs the Meta webhook verification handshake;
  `POST` receives inbound WhatsApp messages, pipes them through the EXISTING agent
  core (`runAgentTurn`), persists the lead tagged `channel: "whatsapp"`, and replies
  via the WhatsApp Business Cloud API using `fetch`. Conversation id is `wa_<wa_id>`
  so multi-turn context is preserved per sender. Booking links are appended to the
  reply text (WhatsApp text has no buttons here).
- **Reuses:** systemPrompt, guardrails, qualify, storage — identical to the website
  concierge. WhatsApp leads appear in the same dashboard, tagged by channel.
- **Env / secrets (deploy-time, never hardcoded):**

  | Var | Required | Purpose |
  | --- | --- | --- |
  | `WHATSAPP_VERIFY_TOKEN` | Yes | Shared secret you set in the Meta webhook config; checked on `GET` verify. |
  | `WHATSAPP_TOKEN` | Yes (to send) | Access token (system user / permanent) for the Cloud API send endpoint. |
  | `WHATSAPP_PHONE_ID` | Yes (to send) | The phone number id replies are sent from. |

- **To take it live:**
  1. Create a Meta app + WhatsApp Business account; add a phone number, get its
     `phone_number_id` and a permanent access token.
  2. Set the three env vars in the host.
  3. In the Meta webhook config, point the callback URL at `https://<your-domain>/api/whatsapp`,
     set the verify token to match `WHATSAPP_VERIFY_TOKEN`, and subscribe to the
     `messages` field.
  4. Message the number; the concierge replies. Check `/dashboard` for the lead
     (channel = whatsapp).
  - Note: the Graph API version is pinned to `v21.0` in the route; bump if needed.
  - Note: this webhook does not verify the `X-Hub-Signature-256` payload signature.
    Add `WHATSAPP_APP_SECRET` + HMAC verification before a public production deploy.

---

## 2. GROW-06 — "Try it on your site" demo lead magnet

- **Component:** `src/components/try-it.tsx` (mounted on the homepage between
  Pricing and the CTA, id `#try-it`).
- **Route:** `src/app/api/try-it/route.ts` (thin).
- **What it does:** a prospect enters their website URL + email. The route fetches
  that URL's main text and uses `generateText` (same Anthropic client) to write a
  short sample of how the intelbase OS concierge would greet and qualify that site's
  visitors. The email is captured as a lead (`source: "try-it"`, `contact.website`).
- **Guardrails:** fetch failures degrade to an on-brand static sample (`degraded:true`),
  fetched content is byte-capped (200 KB) and char-capped (6 KB), a 7s timeout stops
  slow sites, only `text/html`/`text/plain` is processed, `<script>`/`<style>` are
  stripped and **no remote script is ever executed** (pure string processing),
  and localhost/internal hosts are rejected to limit SSRF surface.
- **Env / secrets:** none new. Uses the existing `ANTHROPIC_API_KEY` (and optional
  `ANTHROPIC_MODEL`).
- **To take it live:** ensure `ANTHROPIC_API_KEY` is set (already required by the
  base agent). The "we emailed you the full demo" copy implies an email send; wire
  your ESP (e.g. Resend/SendGrid) to actually deliver it, or soften the copy. No
  email is sent today — the lead is captured for follow-up.
  - Production note: for hardened SSRF protection, resolve the submitted host and
    block private IP ranges, not just the localhost string checks included here.

---

## 3. GROW-08 — AI Readiness Audit tool

- **Component:** `src/components/readiness-audit.tsx` (scorecard, scored client-side).
- **Page:** `src/app/audit/page.tsx` + `src/components/audit-page-view.tsx`
  (standalone, shareable `/audit` URL with its own header/back link).
- **Linkable from:** the footer "Studio" column (`/audit`). The section can also be
  dropped inline on the homepage by importing `ReadinessAudit`.
- **Route:** `src/app/api/audit/route.ts` (thin; captures the lead only).
- **What it does:** 7 questions about how the business handles leads today. Computes
  a 0..100 readiness score and a tier (Autonomy-ready / Half-manual / Leaking leads),
  maps weak answers to the intelbase OS modules that close each gap, and shows a
  tailored recommendation. Captures name/email/business as a lead (`source: "audit"`)
  with the score, tier, and answers in the transcript. Sensible empty state (progress
  counter) and result state (gauge + module plan + book-a-call).
- **Env / secrets:** none new (scoring is client-side; the route only persists).
- **To take it live:** ensure the lead store is durable for your host (see the
  serverless caveat in `storage.ts` / `README.md`). As with try-it, the "email me the
  scorecard" copy implies an email send; wire an ESP or soften the copy. No email is
  sent today.

---

## 4. GROW-01 — Retargeting hook (concierge abandonment)

- **Helper:** `trackConciergeAbandoned` in `src/lib/meta-pixel.ts` (uses
  `fbq("trackCustom", ...)`).
- **Wired in:** `src/components/chat-widget.tsx`. It counts engagement turns,
  latches `booked` when the visitor clicks the booking CTA, and fires the custom
  event **once** on `visibilitychange -> hidden` or `pagehide` when the visitor
  engaged (sent at least one message) but did NOT book.
- **Resilience:** the pixel helper no-ops if `fbq` is absent, so the chat never
  crashes when the Pixel is missing or blocked. The fire-once guard prevents dupes.
- **Custom event:** `ConciergeAbandoned`, params `{ content_name: "concierge_no_booking", turns }`.
- **Env / secrets:** none new. Uses the existing Meta Pixel already loaded site-wide
  via `src/components/analytics/meta-pixel.tsx`.

### Retargeting audience rule (for the Ad Engine)

Build a Custom Audience in Meta Ads Manager:

- **Include:** people who triggered the custom event `ConciergeAbandoned` in the
  last **30 days** (engaged the concierge, left without booking).
- **Exclude:** people who triggered the standard `Lead` event (`discovery_call_cta`)
  or `Schedule` (they booked or are mid-booking).

Result: ads retarget warm visitors who talked to the OS but did not book, without
wasting spend on people who already converted. Tune the 30-day window per sales cycle.

---

## Storage changes (backward compatible)

`LeadRecord` / `UpsertLeadInput` gained optional `channel`, `source`, and `contact`
fields (see `types.ts`, `storage.ts`, and `channels.md`). All optional and defaulted,
so lead records written before this work stay valid. `storage.upsert` merges
`contact` field by field and latches `channel`/`source` to their first value, so a
later turn never erases an earlier capture.

## Build / verification status

- Route handler and page conventions were checked against the fork docs in
  `node_modules/next/dist/docs/01-app/` (route-handlers, layouts-and-pages,
  metadata). They match the standard App Router conventions the existing
  `/api/agent`, `/api/leads`, and `/dashboard` already use.
- See the top-level return note for whether `npm run build` was run and passed.
