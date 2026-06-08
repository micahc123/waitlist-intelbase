# Intelbase - Project Context (read this first)

> Drop-in context for a new Claude Code session. What this is, where things live,
> current state, how to run it. Keep this updated as the project evolves.

## What Intelbase is
A subscription web SaaS: an all-in-one AI business operating system. A business signs up,
connects their tools, and AI agents run their front office (answer leads, book calls, follow
up, run ads) with human approval. Funnel: marketing landing -> Stripe trial -> Supabase login
-> onboarding -> the `/app` product.

## Stack (this is a MODIFIED Next.js fork - important)
- Next.js 16.2.2 **modified fork** (App Router). Conventions differ from stock: middleware is
  `src/proxy.ts` (not middleware.ts), route params are async, etc. Read
  `node_modules/next/dist/docs/` before writing route/middleware/server-action code.
- React 19, TypeScript. Supabase (Postgres + pgvector + Auth). Stripe (billing).
- Agents: Claude via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`). Integrations: Composio.
- Design tokens: `src/styles/tokens.css` (`--ib-*` vars, `.ibx-*` primitives). Plus Jakarta Sans.
- No em dashes anywhere in on-screen copy (project rule).

## Where things live
- `src/app/page.tsx` + `src/components/landing/*` - marketing landing.
- `src/app/login|signup`, `src/app/(auth)/actions.ts`, `src/app/auth/*` - auth (Supabase).
- `src/proxy.ts` + `src/lib/supabase/*` - session + route gating.
- `src/app/onboarding/*` + `src/components/onboarding/*` - signup wizard.
- `src/app/app/page.tsx` + `src/components/app/*` - THE PRODUCT (SaaS work shell). Views in
  `src/components/app/views/*`: overview, approvals, inbox, leads, contacts, tasks, calendar,
  agents, automations, knowledge, insights, settings. Topbar has notifications + cmd-K search.
- `src/components/app/graph/force-graph.tsx` - reusable force graph (Agents + Knowledge use it).
- `src/lib/db/*` - data layer (one module per entity) with demo-fallback ONLY for the demo
  pass; real signed-in orgs get real data. `src/lib/db/util.ts` -> `isDemoContext(orgId)`.
- `src/lib/agents/*` - agent runtime (Claude + tools + memory). `src/app/api/agents/[id]/chat`.
- `src/lib/integrations/*` + `src/app/api/integrations/*` - Composio OAuth (real or honestly
  disabled when no key; no fake connect).
- `src/lib/memory/*` - pgvector memory (vector recall with OpenAI, keyword fallback without it).
- `src/components/command/*` + `src/app/app/command` - the cinematic command plane (kept, but
  UNLINKED from the sidebar; the graph is integrated into the workspace instead).
- `supabase/*.sql` - database schema (run in order: schema, memory, app-schema, app-schema-2).
- `docs/superpowers/specs|plans/*` - design specs + phase plans for the major builds.
- `HANDBACK.md` - the provisioning/keys checklist.

## Real vs demo (key behavior)
- Logged-in user -> ALWAYS a real org (auto-created in `src/lib/auth.ts getUserAndOrg` if the
  signup trigger did not run). Real (often empty) data. No demo.
- The public demo pass (`/api/demo`, sets `ib_demo` cookie) -> demo data, for showcasing.
- Everything degrades gracefully with missing keys (the app runs; live features switch on with
  keys). See SETUP.md.

## Run it
- `npm run dev` -> http://localhost:3000. `npm run build` to verify.
- Env in `.env.local` (gitignored). See `docs/SETUP.md` for the variable list and what each
  unlocks. SQL must be run in Supabase for real data to persist.

## Git / deploy
- Main repo: `micahc123/intelbase` (origin). Also pushed to `micahc123/waitlist-intelbase`
  branch `intelbase-app`. Working branch: `feat/os-demo-dashboard`.
- Deploy caveat: the modified Next fork must be present on the host; verify the production
  build (a clean `npm install` pulls registry Next - confirm it behaves like the fork).

## See also
- `docs/SETUP.md` - keys + SQL + setup steps.
- `docs/STATUS.md` - what is built and what is deferred.
