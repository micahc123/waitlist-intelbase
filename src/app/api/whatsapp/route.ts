// VERIFY AGAINST FORK: This uses STANDARD Next.js App Router route handler
// conventions (named `GET`/`POST` exports taking a `Request`, returning
// `Response`, plus `runtime`/`dynamic` config exports). This repo runs a
// modified/breaking Next.js fork whose docs live in node_modules/next/dist/docs/.
// The route-handlers doc (01-app/01-getting-started/15-route-handlers.md) confirms
// these conventions hold in this fork: `export async function GET(request: Request)`
// and `export const dynamic` are valid. Keep this file a THIN wrapper, all agent
// logic lives in src/lib/agent/.
//
// GROW-05: WhatsApp Concierge. A thin WhatsApp Business Cloud API webhook:
//   - GET  verifies the webhook subscription (hub.challenge handshake).
//   - POST receives inbound messages, runs them through the EXISTING agent core
//          (runAgentTurn), persists the lead tagged channel = "whatsapp", and
//          replies via the WhatsApp send API using fetch.
// It reuses the same systemPrompt/guardrails/qualify/storage as the website
// concierge, so WhatsApp leads land in the same store and the same dashboard.
//
// Env (all deploy-time secrets, never hardcoded):
//   WHATSAPP_VERIFY_TOKEN  - shared secret you set in the Meta webhook config.
//   WHATSAPP_TOKEN         - permanent/system-user access token for the send API.
//   WHATSAPP_PHONE_ID      - the phone number id messages are sent from.

import { runAgentTurn } from "@/lib/agent/runAgent";
import { getLeadStore } from "@/lib/agent/storage";
import type { ChatMessage } from "@/lib/agent/types";

// Persistence + the Anthropic and WhatsApp fetch calls require the Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

// ---------------------------------------------------------------------------
// GET: webhook verification handshake.
// Meta calls this once when you subscribe the webhook. We echo back hub.challenge
// only when hub.verify_token matches our shared secret.
// ---------------------------------------------------------------------------
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (!expected) {
    // Misconfiguration is a server problem, surface it in logs, fail closed.
    console.error("[whatsapp] WHATSAPP_VERIFY_TOKEN is not set.");
    return new Response("Webhook not configured.", { status: 500 });
  }

  if (mode === "subscribe" && token === expected && challenge) {
    // Meta expects the raw challenge string echoed back, not JSON.
    return new Response(challenge, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// POST: inbound message handler.
// WhatsApp delivers a nested payload. We extract the first text message, run a
// turn, persist, and send the reply. We always return 200 quickly so Meta does
// not retry, even when our own processing has nothing to do.
// ---------------------------------------------------------------------------
export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    // Acknowledge anyway so Meta does not hammer us with retries.
    return Response.json({ received: true });
  }

  const inbound = extractInboundMessage(payload);
  if (!inbound) {
    // Status callbacks, non-text messages, and reactions land here. Ack and move on.
    return Response.json({ received: true });
  }

  const { from, text } = inbound;
  // Conversation id is the sender's wa_id, so every message from a number folds
  // into one lead record, just like conversationId does for the web widget.
  const conversationId = `wa_${from}`;

  const store = getLeadStore();

  // Load prior transcript + qualification so the agent has context across turns.
  const existing = await store.get(conversationId).catch(() => null);
  const priorMessages: ChatMessage[] = existing?.messages ?? [];
  const messages: ChatMessage[] = [
    ...priorMessages,
    { role: "user", content: text },
  ];

  const result = await runAgentTurn({
    messages,
    qualification: existing?.qualification,
  });

  // Build the reply text. If a booking action is surfaced, append the link so a
  // WhatsApp user (no buttons here) still gets a clear next step.
  let replyText = result.reply;
  if (result.booking) {
    replyText = `${replyText}\n\n${result.booking.label}: ${result.booking.url}`;
  }

  const fullTranscript: ChatMessage[] = [
    ...messages,
    { role: "assistant", content: replyText },
  ];

  // Persist tagged as the WhatsApp channel. Best-effort, a storage failure must
  // not stop us from replying.
  await store
    .upsert({
      id: conversationId,
      qualification: result.qualification,
      messages: fullTranscript,
      channel: "whatsapp",
      source: "concierge",
      contact: { phone: from },
    })
    .catch(() => undefined);

  // Send the reply. Failure is logged but we still ACK the webhook with 200.
  await sendWhatsAppMessage(from, replyText).catch((err) => {
    console.error("[whatsapp] send failed:", (err as Error).message);
  });

  return Response.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type InboundMessage = { from: string; text: string };

// Walks the WhatsApp Cloud API webhook shape and returns the first text message,
// or null for anything we do not handle (statuses, media, malformed payloads).
function extractInboundMessage(payload: unknown): InboundMessage | null {
  const p = payload as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: Array<{
            from?: string;
            type?: string;
            text?: { body?: string };
          }>;
        };
      }>;
    }>;
  };

  const messages = p?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const msg = messages[0];
  if (!msg || msg.type !== "text") return null;

  const from = typeof msg.from === "string" ? msg.from.trim() : "";
  const text = msg.text?.body?.trim() ?? "";
  if (!from || !text) return null;

  return { from, text };
}

// Sends a plain text reply via the WhatsApp Cloud API. Throws on missing config
// or a non-2xx response so the caller can log it.
async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_ID?.trim();

  if (!token || !phoneId) {
    throw new Error(
      "WHATSAPP_TOKEN and WHATSAPP_PHONE_ID must be set to send replies."
    );
  }

  const res = await fetch(`${GRAPH_BASE}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    let detail = "<no body>";
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`WhatsApp API ${res.status}: ${detail}`);
  }
}
