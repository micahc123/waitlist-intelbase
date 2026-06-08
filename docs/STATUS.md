# Intelbase - Status

> What is built vs deferred. Update as work lands.

## Built and working
- Marketing landing + pricing, polished on the design-token system.
- Auth: Supabase email/password (Google optional), org per user, route gating via `proxy.ts`.
- Billing: Stripe checkout (14-day trial), webhook sync, portal, subscription gating.
- Onboarding wizard: business -> connect tools -> goals -> plan.
- The product app `/app` (real SaaS work shell, responsive sidebar, cmd-K search, notifications):
  Overview, Approvals (human-in-the-loop + audit), Inbox (unified conversations), Leads (CRM),
  Contacts, Tasks (kanban), Calendar (week view), Agents (control + guardrails + kill switch +
  graph), Automations, Knowledge (graph-first), Insights (reporting), Settings (integrations,
  account, team/seats, profile).
- Engine: Claude agent runtime (tool-calling), Composio integrations (real OAuth or honestly
  disabled), pgvector memory (vector + keyword fallback), Composio triggers webhook.
- Reusable Obsidian-style force graph integrated into Agents + Knowledge (toned-down, spinny).
- Real-vs-demo: signed-in orgs get real data; demo only for the public demo pass.

## Recent fixes
- Authenticated users always get a real org (auto-create) -> no demo data when logged in.
- Integrations: removed fake "connected" toggle; real OAuth when Composio configured, else a
  clear "needs a Composio key" state.
- Memory works without OpenAI (keyword recall fallback).
- Removed obsolete cruft (old /os, /work, /dashboard, /audit, bot-demo APIs, old components).
- Command Center unlinked; graph lives in the workspace.

## Deferred (needs infra, not just UI) - next milestones
- Scheduled / recurring agent jobs (a queue / cron, e.g. Inngest or Supabase pg_cron).
- Real email notifications + digests (an email pipeline).
- Usage metering + quota enforcement per plan.
- Customer-facing API keys + outbound webhooks.
- GDPR data export / deletion tooling.
- A/B prompt testing, multi-currency / i18n.

## Known caveats
- Deploy: the modified Next fork must work on the host; verify the production build.
- WhatsApp + Meta Ads connect but go live only after Meta business verification.
- The cinematic command plane (`/app/command`) still uses simulated sim data (it is a
  showpiece, unlinked); the real product is the work shell.
