# Complete the AI OS - Gap-Closure Phase Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Remove obsolete cruft and close the feature gaps so Intelbase is a credible all-in-one AI business operating system (add Contacts, Tasks, Calendar, Automations, Insights/reporting, Notifications, global search, Team), all on the existing design system, DB-backed with the established demo-fallback pattern.

**Architecture:** Same as the current product: new entities get a Postgres table (idempotent SQL in `supabase/`) + a resilient data module in `src/lib/db/*` that returns realistic demo data when Supabase is unconfigured/empty; new client views live in `src/components/app/views/*`, fetch via thin `src/app/api/app/*` route handlers, and are mounted in the `AppShell` sidebar. Everything compiles and runs with no keys (demo mode), switching to live when keys are set. No new dependencies.

**Tech Stack:** Next.js 16.2.2 fork (App Router; route handlers; `proxy.ts` not `middleware`), React 19, Supabase (pgvector already), the `--ib-*` tokens + `.ibx-*` primitives in `src/styles/tokens.css`, lucide-react, the reusable `force-graph.tsx`. No em dashes in copy. Verification: `npm run build` passes + Playwright screenshot per surface (no unit-test runner; fork-sensitive node_modules).

---

## Conventions (read once)
- New entity = (1) table in `supabase/app-schema-2.sql`, (2) types in `src/lib/db/types.ts`, (3) demo data in `src/lib/db/demo.ts`, (4) a data module `src/lib/db/<entity>.ts` (resilient demo fallback, never throws), (5) API route `src/app/api/app/<entity>/route.ts` (`getUserAndOrg()` -> `org?.id ?? "demo-org"`, `dynamic="force-dynamic"`), (6) a client view `src/components/app/views/<view>.tsx` using `.ibx-*` tokens, (7) registered in `src/components/app/app-shell.tsx` + `sidebar.tsx`.
- Do NOT touch the command plane (`src/components/command/*`, `src/lib/command/*`) or the marketing landing during gap work.
- Each task ends with `npm run build` green + a commit.

---

## Task 1: Remove obsolete cruft (safe deletions)

**Delete (verify no remaining imports first with grep):**
- Routes: `src/app/os/`, `src/app/work/`, `src/app/dashboard/`, `src/app/audit/`, `src/app/api/agent/`, `src/app/api/leads/`, `src/app/api/try-it/`, `src/app/api/audit/`, `src/app/api/whatsapp/`.
- Components (root, now unused): `hero.tsx, services.tsx, pricing.tsx, process.tsx, proof.tsx, past-projects.tsx, cta.tsx, sticky-cta.tsx, top-nav.tsx, footer.tsx, quote-modal.tsx, dashboard-view.tsx, audit-page-view.tsx, readiness-audit.tsx, try-it.tsx, chat-widget.tsx`, plus `src/components/os/` (the old dense dashboard) and `src/components/icons.tsx`/`logos.tsx`/`services.tsx` only if unused.
- Libs: `src/lib/os-demo/`, `src/lib/agent/` (singular, old).

- [ ] **Step 1:** For each candidate, `grep -rl "<basename-without-ext>" src/` to confirm only self-references / the deleted route import it. KEEP anything still imported by the landing (`src/components/landing/*`), the app (`src/components/app/*`, `src/lib/db|agents|memory|integrations|supabase`), or the command plane.
- [ ] **Step 2:** Delete confirmed-safe files/dirs. Remove now-dead imports (e.g. anything importing the deleted components). The `/api/agent`, `/api/leads`, `/api/try-it`, `/api/audit`, `/api/whatsapp` endpoints depend on `lib/agent/` and the bot demo - delete together. NOTE: `src/lib/meta-pixel.ts` + `components/analytics/` stay (layout uses MetaPixel).
- [ ] **Step 3:** `npm run build` must pass (this proves nothing live still imported the deleted files). Fix any straggler imports.
- [ ] **Step 4:** Commit `chore(cleanup): remove obsolete /os, /work, /dashboard, /audit, bot-demo APIs, old marketing components and libs`.

## Task 2: Data layer for new entities

**Files:** `supabase/app-schema-2.sql` (new), `src/lib/db/types.ts` (extend), `src/lib/db/demo.ts` (extend), and modules `src/lib/db/{contacts,tasks,calendar,automations,notifications,team}.ts`.

- [ ] Tables (org-scoped, RLS via `is_org_owner`, indexes): `contacts` (name, company, email, phone, type [customer/vendor/partner/team], tags, last_contact_at), `tasks` (title, detail, status [todo/doing/done], priority, due_at, assignee, source [human/agent], agent_id), `calendar_events` (title, start_at, end_at, attendee, channel, status, location), `automations` (name, enabled, trigger jsonb, steps jsonb, last_run_at, runs int), `notifications` (kind, title, body, read bool, link, created_at), `team_members` (email, name, role [owner/admin/member/viewer], status [active/invited], invited_at).
- [ ] Types for each in `types.ts` (string-union enums).
- [ ] Deterministic demo data for each in `demo.ts` (realistic HK business: ~16 contacts, ~12 tasks across statuses with a few agent-generated, ~10 calendar events this/next week, ~5 automations e.g. "New Ads lead -> welcome email + book call", ~8 notifications mix read/unread, ~4 team members incl invited).
- [ ] Each module: `list*`, plus the writes its view needs (e.g. `updateTaskStatus`, `toggleAutomation`, `markNotificationRead`, `inviteTeamMember`). Resilient demo fallback; never throw.
- [ ] Add `supabase/app-schema-2.sql` to HANDBACK note (run after `app-schema.sql`).
- [ ] `npm run build`; commit `feat(real): data layer for contacts, tasks, calendar, automations, notifications, team`.

## Task 3: New work views + sidebar wiring

**Files:** `src/components/app/views/{contacts,tasks,calendar,automations,insights}.tsx`, API routes `src/app/api/app/{contacts,tasks,calendar,automations}/route.ts`, edit `src/components/app/app-shell.tsx` + `sidebar.tsx`.

- [ ] **Contacts:** a CRM-grade table (name, company, type chip, channel, tags, last contact, value) + search/filter + a detail drawer. Reuse `.ibx-table`.
- [ ] **Tasks:** a board (To do / Doing / Done columns) AND a list toggle; cards show title, priority chip, due date, an "agent" badge when agent-generated; move status (optimistic -> POST). 
- [ ] **Calendar:** a week view (7 columns, time rows) rendering `calendar_events`, plus an upcoming list; channel-colored events; "booked by Scheduler agent" badges.
- [ ] **Automations:** a list of automation rules (name, trigger summary, enabled toggle, runs count, last run) + a simple read-only "trigger -> steps" visualization per rule (use small chips/arrows, or the force-graph for a rule map). A "New automation" affordance opening a basic builder (trigger select + step chips); persisting is best-effort.
- [ ] **Insights:** a reporting dashboard - hand-rolled SVG charts (leads over time, conversion funnel new->qualified->booked->won, agent activity, response time, pipeline by source). Honest numbers from `getOverviewMetrics` + the new lists; empty states.
- [ ] Register all five in `app-shell.tsx` `ViewKey` + the `Stage`/view router, and add nav items (lucide icons: Contacts=Contact, Tasks=ListChecks, Calendar=Calendar, Automations=Workflow/Zap, Insights=BarChart3) to `sidebar.tsx` under the Workspace group (sensible order: Overview, Inbox, Approvals, Tasks, Leads, Contacts, Calendar, Agents, Automations, Knowledge, Insights). Keep Command Center + Settings as-is.
- [ ] `npm run build`; commit `feat(real): Contacts, Tasks, Calendar, Automations, Insights views + sidebar`.

## Task 4: Notifications + global search (topbar)

**Files:** `src/components/app/topbar.tsx` (edit), `src/components/app/notifications.tsx` (new), `src/components/app/global-search.tsx` (new), API `src/app/api/app/notifications/route.ts`, `src/app/api/app/search/route.ts`.

- [ ] **Notifications:** a bell in the topbar with an unread badge; clicking opens a dropdown panel listing `notifications` (kind icon, title, body, time, read state); mark-read (optimistic -> POST); "mark all read". 
- [ ] **Global search:** wire the existing topbar search input (and a Cmd/Ctrl-K shortcut) to `/api/app/search?q=` which queries across leads, contacts, conversations, tasks, knowledge (demo: filter the demo datasets) and returns grouped results; selecting a result switches to the relevant view (via a callback into the shell). 
- [ ] `npm run build`; commit `feat(real): notifications center + global search (cmd-k) in the app topbar`.

## Task 5: Team/seats in Settings + account/profile

**Files:** `src/components/app/views/settings.tsx` (edit), API `src/app/api/app/team/route.ts`.

- [ ] Add a **Team** section to Settings: list `team_members` (avatar, name, email, role chip, status [active/invited]), an "Invite teammate" form (email + role -> POST inviteTeamMember, demo returns an invited row), and role editing. Note seats tie to the plan.
- [ ] Add a **Profile** subsection: display name, timezone, notification preferences (toggles, local/best-effort). Keep existing Integrations + Account + Billing.
- [ ] `npm run build`; commit `feat(real): team/seats management + profile preferences in Settings`.

## Task 6: Polish - error/empty/loading + mobile + a11y pass

**Files:** `src/components/app/app-shell.tsx`, `src/components/app/views/view-shell.tsx` (shared), `src/components/app/app.css`.

- [ ] Add a shared `<ErrorState onRetry>` and a consistent `<Loading>` skeleton in `view-shell.tsx`; ensure every view shows loading -> data | empty | error (with retry) consistently.
- [ ] Make the sidebar responsive: collapsible to icons under ~1100px and a hamburger/drawer under ~768px (no horizontal scroll; main content reflows). Topbar search collapses to an icon on small screens.
- [ ] A11y pass: focus-visible rings on all interactive elements (tokens already provide `--ib-ring`), `aria-current` on active nav, `aria-label` on icon-only buttons, heading hierarchy, `prefers-reduced-motion` respected, color-not-only for status (chips already pair icon/text). 
- [ ] `npm run build`; commit `polish(app): consistent loading/empty/error states, responsive sidebar, accessibility pass`.

---

## Out of scope (future phases; note in HANDBACK)
Scheduled/recurring agent jobs (needs a queue/cron - infra), real email notifications/digests (needs an email pipeline beyond Resend wiring), usage metering/quota enforcement, customer API keys/webhooks, GDPR export tooling, A/B prompt testing, multi-currency/i18n. These are real but require infra or are lower priority than the surfaces above.

## Self-review
- Cruft removal (T1), new entities data layer (T2), the five gap surfaces + nav (T3), notifications + global search (T4), team/seats + profile (T5), polish/responsive/a11y (T6). Covers the report's Tier 1-2 buildable-in-app gaps; defers infra-heavy items explicitly.
- No new deps. Demo-fallback pattern keeps everything runnable without keys. Verification is build + visual (no unit runner, consistent with the project).
