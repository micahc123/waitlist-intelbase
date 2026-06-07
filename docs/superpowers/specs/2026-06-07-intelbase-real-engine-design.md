# Intelbase Real Engine - Design Spec (integrations, memory, agents)

> Date: 2026-06-07
> Status: Proposed - turns the simulated OS into a functional AI business OS.
> Research-backed (Composio + Vercel AI SDK + Supabase pgvector via context7 official docs).

## 1. Goal

Make the dashboard actually DO things end to end: real tool integrations (via Composio OAuth),
real agents (Claude + Vercel AI SDK tool-calling) that read/write real memory (Supabase
pgvector) and act across the user's connected apps, reacting to inbound events (triggers).
Scope = a functional CORE working end to end, not literally hundreds of connectors.

## 2. Stack (validated against official docs)

- **Agent runtime:** Vercel AI SDK (`ai`) + `@ai-sdk/anthropic` (Claude). Multi-step tool
  loops via `generateText`/`streamText` with `tools` + `stopWhen: stepCountIs(n)`.
- **Integrations + auth + triggers:** Composio (`@composio/core` + `@composio/vercel`).
  Per-user/org connected accounts via OAuth (`toolkits.authorize` -> redirect ->
  `waitForConnection`). 800+ toolkits. Triggers deliver inbound events to a webhook.
- **Memory:** Supabase Postgres + `pgvector`. Embeddings via AI SDK `embedMany` (provider:
  OpenAI `text-embedding-3-small` by default; swappable to Voyage/Cohere). RAG retrieval feeds
  agent context and powers the Memory Cortex with real rows.
- **Scale trick:** Anthropic tool-search (BM25 + `deferLoading`) so agents can expose many
  tools without blowing the context window.

## 3. New dependencies

`@composio/core`, `@composio/vercel`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai` (embeddings).
(All leaf packages; verify the fork build after install, as before.)

## 4. Keys / provisioning (HANDBACK - I do not provision or spend)

- `ANTHROPIC_API_KEY` (already used by the old agent).
- `COMPOSIO_API_KEY` + a Composio account; configure OAuth apps per toolkit in Composio.
- `OPENAI_API_KEY` (embeddings) OR a Voyage/Cohere key.
- Supabase: enable the `vector` extension; run new migration.
- WhatsApp/Meta: require Meta business verification + app review (gated by Meta, not us).

## 5. Architecture

### 5.1 Memory (`src/lib/memory/`)
- Migration: `memories` table `(id, org_id, kind, source, title, content, embedding vector(1536),
  metadata jsonb, created_at)` + an ivfflat index; RLS by org. A `match_memories(org_id,
  query_embedding, k)` SQL function for similarity search.
- `embed(text)` / `embedMany(texts)` via AI SDK + OpenAI.
- `remember(orgId, {kind, content, ...})` -> embed + insert. `recall(orgId, query, k)` ->
  similarity search. Used by every agent and to log conversations/events.
- The Memory Cortex (`/app` Brain) reads real per-category counts + sessions from `memories`.

### 5.2 Integrations (`src/lib/integrations/composio.ts` + routes)
- A Composio client (Vercel provider) keyed off the org id as the Composio userId/entity.
- `listToolkits()` / `getConnections(orgId)` / `startConnect(orgId, toolkit)` (returns redirect
  URL) / `completeConnect` (callback) -> persist into the existing `connections` table
  (provider, connected, the Composio connected_account_id in meta).
- Onboarding + Settings "connect your tools" call these for REAL OAuth (replacing the
  simulated toggle). Resilient: if `COMPOSIO_API_KEY` unset, fall back to the simulated toggle
  so the flow still demos.
- `getToolsForOrg(orgId, toolkits)` -> Composio tools for the AI SDK.

### 5.3 Agents (`src/lib/agents/`)
- `agents.ts`: definitions for the core agents, each `{ id, name, domain, systemPrompt,
  toolkits: string[], model }`. Core set: Concierge (web chat + calendar), Inbox Manager
  (Gmail triage/draft), Scheduler (Google Calendar), Lead Gen / Outreach (Gmail/HubSpot),
  Nurture, Ad Engine (Meta, gated). More added over time.
- `run.ts`: `runAgent({ orgId, agentId, messages })` -> recall memory -> build system prompt +
  RAG context -> `generateText`/`streamText` with Composio tools + `stopWhen` -> persist the
  turn to memory -> return reply + tool actions taken. Streaming variant for chat UX.
- API: `POST /api/agents/[id]/chat` (streamed) for live conversations with an agent.

### 5.4 Triggers (`src/app/api/composio/webhook/route.ts`)
- Receives Composio trigger events (e.g. new Gmail message). Verifies signature, maps to the
  org + the right agent, calls `runAgent`, writes results to memory + the live feed. This is
  how agents act autonomously on inbound events.

### 5.5 Dashboard wiring (`/app`)
- Agent nodes in the constellation + the Deck open a REAL chat with that agent (streamed via
  the chat API) instead of the simulated detail.
- The live feed shows real agent runs + tool actions (from a `runs`/events table or memory).
- Memory Cortex shows real `memories`.
- Counters can reflect real rows where available; otherwise keep seeded.

## 6. Build phases

1. **Deps + Memory**: install, pgvector migration + memory lib (embed/remember/recall). Verify build.
2. **Integrations**: Composio client + connect routes + wire onboarding/Settings to real OAuth (resilient fallback).
3. **Agent runtime**: agent defs + runAgent + streamed chat API. One agent (Concierge) fully real (chat + calendar booking).
4. **Dashboard live wiring**: agent chat in `/app`, real feed, Memory Cortex from real data.
5. **Triggers + more agents**: Composio webhook -> agent; add Inbox + Scheduler + Lead Gen.
6. **HANDBACK update**: Composio/OpenAI keys, pgvector enable, OAuth app config, Meta gating.

## 7. Resilience + honesty

- Everything COMPILES and the app RUNS without the new keys: agents/integrations degrade to the
  current simulated behavior; live functionality switches on when keys are set (same pattern as
  the Supabase/Stripe shell).
- WhatsApp + Meta Ads are real but gated by Meta verification; Gmail/Calendar/Slack/HubSpot are
  live immediately once Composio is configured.
- I provision nothing and spend nothing; all keys/accounts are in HANDBACK.

## 8. Success criteria

- A signed-in org can connect Gmail + Google Calendar via real OAuth.
- Chatting the Concierge agent in `/app` produces real Claude responses that can read the
  calendar and book a meeting, using the org's connected account, with the conversation stored
  in pgvector memory and recalled later.
- A Composio trigger (new email) fires the Inbox agent and posts a result to the feed.
- The Memory Cortex reflects real stored memories.
- Build passes; no keys committed; provisioning in HANDBACK.
