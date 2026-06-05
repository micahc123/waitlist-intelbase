// VERIFY AGAINST FORK: This uses STANDARD Next.js App Router route handler
// conventions (named `POST` export taking a `Request`, returning `Response`).
// This repo runs a modified/breaking Next.js fork whose docs live in
// node_modules/next/dist/docs/ and were NOT readable when this was written.
// After `npm install`, CHECK the route handler signature, the request/response
// types, and whether a `runtime`/`dynamic` export is required, against the fork
// docs. Keep this file a THIN wrapper, all logic is in src/lib/agent/.
//
// AGENT-01: POST handler. Receives the conversation, runs the agent, persists the
// lead, returns the reply + state.

import { runAgentTurn } from "@/lib/agent/runAgent";
import { getLeadStore } from "@/lib/agent/storage";
import type { ChatMessage, LeadQualification } from "@/lib/agent/types";

// Persistence + the Anthropic fetch require the Node runtime, not edge.
// VERIFY AGAINST FORK: confirm this is the correct way to opt into Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgentRequestBody = {
  // Conversation id, so multiple turns map to one lead record. Client generates it.
  conversationId?: string;
  // Full message history. Latest entry is the new visitor message.
  messages?: ChatMessage[];
  // Optional client-held qualification (server storage is the source of truth).
  qualification?: LeadQualification;
};

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m as ChatMessage).role &&
        typeof (m as ChatMessage).content === "string"
    )
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: AgentRequestBody;
  try {
    body = (await request.json()) as AgentRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidMessages(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "`messages` must be a non-empty array of { role, content }." },
      { status: 400 }
    );
  }

  const conversationId =
    typeof body.conversationId === "string" && body.conversationId.trim()
      ? body.conversationId.trim()
      : cryptoRandomId();

  const store = getLeadStore();

  // Load prior qualification from storage so the state machine is authoritative.
  const existing = await store.get(conversationId).catch(() => null);
  const priorQualification =
    existing?.qualification ?? body.qualification ?? undefined;

  const result = await runAgentTurn({
    messages: body.messages,
    qualification: priorQualification,
  });

  // Persist the full transcript (including this assistant reply) + qualification.
  const fullTranscript: ChatMessage[] = [
    ...body.messages,
    { role: "assistant", content: result.reply },
  ];

  // Persistence is best-effort: a storage failure must not block the reply.
  await store
    .upsert({
      id: conversationId,
      qualification: result.qualification,
      messages: fullTranscript,
    })
    .catch(() => undefined);

  return Response.json({
    conversationId,
    reply: result.reply,
    qualification: result.qualification,
    handoff: result.handoff,
    booking: result.booking,
    confidence: result.confidence,
  });
}

// Stable random id without new deps. Uses Web Crypto when present.
function cryptoRandomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
