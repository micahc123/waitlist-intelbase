# Channels

The agent core (`runAgentTurn`) is channel-agnostic. The same systemPrompt,
guardrails, qualification state machine, and lead store serve every surface. Each
channel is a thin transport adapter that maps an inbound message to a
`ChatMessage[]`, calls `runAgentTurn`, persists the lead, and sends the reply back
on its own wire.

## Lead metadata

`LeadRecord` carries three optional, backward-compatible fields (see `types.ts`):

- `channel`: `"web" | "whatsapp"`. Missing = treat as `"web"`.
- `source`: `"concierge" | "try-it" | "audit"`. Missing = treat as `"concierge"`.
- `contact`: `{ name?, email?, business?, phone?, website? }`. Captured by the
  lead-magnet tools; the live chat usually leaves it empty.

These are all optional so lead records written before the multi-channel work stay
valid. `storage.upsert` merges `contact` field by field and latches
`channel`/`source` to their first non-null value, so a later turn never erases an
earlier capture.

## Channels in use

| Channel  | Source     | Transport / entrypoint                | conversationId  |
| -------- | ---------- | ------------------------------------- | --------------- |
| web      | concierge  | `src/components/chat-widget.tsx` -> `POST /api/agent` | client-generated |
| whatsapp | concierge  | `POST /api/whatsapp` (WhatsApp Cloud API webhook)     | `wa_<wa_id>`     |
| web      | try-it     | `POST /api/try-it` (lead magnet, one-shot generation) | `tryit_<rand>`   |
| web      | audit      | `POST /api/audit` (readiness scorecard)               | `audit_<rand>`   |

All four write to the same `LeadStore`, so they all appear in `/dashboard`.

## Adding a channel

1. Build a thin route/handler that parses the inbound payload into `ChatMessage[]`.
2. Call `runAgentTurn({ messages, qualification })`.
3. `store.upsert({ id, qualification, messages, channel, source, contact })`.
4. Send `result.reply` (plus `result.booking` link if present) on the channel's wire.

Do not duplicate guardrails or qualification in the adapter. The core owns them.
