# intelbase OS demo agent (Phase 3)

The guardrailed, autonomous website concierge that answers visitors, qualifies them,
and books calls. It runs live on intelbase's own site as the dogfood demo, and feeds
the dashboard at `/dashboard`.

All real logic lives in this framework-agnostic folder (`src/lib/agent/`) with no
imports from `next`. The Next.js surface is two thin route handlers plus two thin
pages/components.

## What is wired

- `types.ts` — shared types (messages, qualification, structured output, lead record).
- `systemPrompt.ts` — builds the system prompt from the locked messaging foundation
  (offer, 5 capabilities, process, pricing-as-ranges, proof, voice, guardrails) and
  the strict JSON output contract.
- `guardrails.ts` (AGENT-04) — prompt rules plus a code-level escape hatch: a
  confidence threshold and a price/promise backstop. A risky reply is suppressed and
  replaced with a handoff before it can reach a visitor.
- `qualify.ts` (AGENT-02) — deterministic state machine; merges per-turn extraction
  into intent / business type / need and decides when `qualified` is true.
- `booking.ts` (AGENT-03) — surfaces a booking action (uses `BOOKING_URL`, falls back
  to the site's cal.com link) when qualified or handing off.
- `storage.ts` (AGENT-06) — `LeadStore` interface, a default file/JSON adapter, and a
  KV stub for serverless. Persists each conversation + extracted lead.
- `client.ts` — Anthropic Messages API client via `fetch` (zero new deps).
- `runAgent.ts` — orchestrates one full turn and degrades to a safe handoff on error.

Next.js wrappers (each carries a `// VERIFY AGAINST FORK` header):

- `src/app/api/agent/route.ts` (AGENT-01) — POST: run a turn, persist, return state.
- `src/app/api/leads/route.ts` — GET: leads + metrics for the dashboard.
- `src/components/chat-widget.tsx` (AGENT-01, AGENT-05) — the floating widget.
- `src/app/dashboard/page.tsx` + `src/components/dashboard-view.tsx` (DASH-01/02).

The widget is mounted site-wide in `src/app/layout.tsx`.

## Environment variables

| Var                  | Required            | Default                                          | Purpose |
| -------------------- | ------------------- | ------------------------------------------------ | ------- |
| `ANTHROPIC_API_KEY`  | Yes (deploy-time)   | none (throws if unset)                            | Claude auth. Never hardcoded; set in the host env. |
| `ANTHROPIC_MODEL`    | No                  | `claude-opus-4-8`                                 | Model id. Override for cost/quality. |
| `BOOKING_URL`        | No                  | `https://cal.com/intelbase/discovery-call`        | Where the booking CTA points. |
| `LEAD_STORE`         | No                  | `file`                                            | Adapter: `file` or `kv`. |
| `LEAD_STORE_FILE`    | No                  | `<cwd>/.data/leads.json`                          | Path for the file adapter. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Only if `LEAD_STORE=kv` | none | Provider creds once you implement `KVLeadStore`. |

## Serverless persistence caveat (IMPORTANT)

The default `FileLeadStore` writes to the local filesystem. On serverless hosts
(Vercel, Netlify functions, Lambda) the filesystem is **ephemeral and not shared
between invocations**, so leads written by one request can vanish on the next, and
the dashboard would look empty or inconsistent.

For any real/serverless deploy you must use a hosted store:

1. Add a KV/DB client dependency (see below).
2. Set `LEAD_STORE=kv` and the provider env vars.
3. Implement the methods in `KVLeadStore` (stubbed in `storage.ts`, it throws loudly
   on purpose so a misconfigured deploy fails fast instead of silently losing leads).

The file adapter is correct for local dev or a single long-lived self-hosted Node
process with a writable disk.

## Dependencies to add (the user decides, nothing was installed)

- **Claude SDK (optional):** none required. The agent uses `fetch`. If you prefer the
  official SDK, `npm i @anthropic-ai/sdk` and swap the call inside `client.ts`.
- **Hosted lead store (required for serverless):** e.g. `npm i @vercel/kv` (or
  `@upstash/redis`), then implement `KVLeadStore`.

`package.json` was deliberately not edited.

## To take it live (hand-back checklist)

1. `npm install` (node_modules is currently absent).
2. **Verify the four `// VERIFY AGAINST FORK` files** against
   `node_modules/next/dist/docs/` — route handler signatures, `runtime` / `dynamic`
   exports, and page conventions may differ in this Next.js fork.
3. Set `ANTHROPIC_API_KEY` in the host env (and optionally `ANTHROPIC_MODEL`,
   `BOOKING_URL`).
4. For serverless: set `LEAD_STORE=kv`, add a KV client, implement `KVLeadStore`,
   set the provider creds. For local/self-host: nothing extra, the file store works.
5. **Gate `/api/leads` and `/dashboard`** behind auth before exposing publicly. They
   currently return raw captured leads with no auth so the local dogfood works.
6. `npm run build` and typecheck. This was written without a runnable toolchain and
   was **not** built or tested. Fix anything the fork surfaces.
7. Open the site, talk to the concierge in the corner, then check `/dashboard`.
