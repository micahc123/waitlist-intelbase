# Intelbase - Setup (keys, env, database)

> Variable NAMES only. Put real values in `.env.local` (gitignored, never committed).
> The app runs with none of these (demo mode); each unlocks real functionality.

## Environment variables (`.env.local`)
| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth + real data | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + real data | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Org auto-create, memory writes, Stripe webhook | Server-only. SENSITIVE - never expose |
| `ANTHROPIC_API_KEY` | Agents actually reply / act | Claude (opus/sonnet) |
| `COMPOSIO_API_KEY` | Real tool integrations (Gmail, Calendar...) | Without it, Connect is disabled (honest), not faked |
| `COMPOSIO_WEBHOOK_SECRET` | Agents firing on inbound events (triggers) | Optional |
| `OPENAI_API_KEY` | Vector memory recall | OPTIONAL - memory falls back to keyword search without it |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRICE_*` (x6) | Billing/subscriptions | Optional while testing (demo pass bypasses billing) |
| `NEXT_PUBLIC_APP_URL` | Correct redirects in prod | e.g. https://yourdomain |

## Database (Supabase SQL editor) - run IN ORDER
1. `supabase/schema.sql` - profiles, organizations, subscriptions, connections, RLS, the
   new-user trigger.
2. `supabase/memory.sql` - pgvector extension + memories table + match function.
3. `supabase/app-schema.sql` - leads, contacts, conversations, messages, actions, agent_configs,
   knowledge_docs.
4. `supabase/app-schema-2.sql` - tasks, calendar_events, automations, notifications, team_members.

## Auth providers (Supabase dashboard)
- Email/password: enabled by default.
- Google (optional): Authentication -> Providers -> Google -> enable, paste a Google Cloud
  OAuth client ID + secret (create at console.cloud.google.com; redirect URI is the Supabase
  callback shown in that panel). Set Site URL + redirect URLs under Authentication -> URL config.

## Composio integrations (to connect Gmail/Calendar for real)
1. Create a Composio account, set `COMPOSIO_API_KEY`.
2. In Composio, enable the toolkits you want (Gmail, Google Calendar, Slack, HubSpot work
   immediately; WhatsApp + Meta Ads need Meta business verification).
3. Configure each toolkit's auth/OAuth in Composio. Set the post-auth redirect to
   `${APP_URL}/api/integrations/callback?toolkit=<slug>` (helper: `callbackUrl(slug)` in
   `src/lib/integrations/composio.ts`).
4. In the app: Settings -> Integrations -> Connect. With the key set, it runs real OAuth.

## MCP (optional, for Claude Code)
- Supabase MCP server is configured in `.mcp.json` (hosted, OAuth-based). It lets a Claude Code
  session query/manage the Supabase project. Auth happens via browser OAuth on first use.

## Quick start (local, real)
1. Fill `.env.local` (at minimum the 3 Supabase vars + `ANTHROPIC_API_KEY`).
2. Run the 4 SQL files in Supabase.
3. `npm run dev` -> sign up -> onboarding -> your real (empty) workspace at `/app`.
4. Add `COMPOSIO_API_KEY` + configure toolkits to connect real tools.
