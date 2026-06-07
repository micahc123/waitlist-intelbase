// Streamed chat API for a single agent: POST /api/agents/[id]/chat
//
// Body: { messages: { role, content }[] }
// Resolves the caller's org (falling back to a demo org so the chat works in dev
// with no Supabase), then streams a Claude response wired to the org's Composio
// tools and pgvector memory via the agent runtime.
//
// RESILIENCE: when ANTHROPIC_API_KEY is missing the runtime cannot stream, so we
// return the canned offline text as a normal Response. Nothing here throws on
// the request path; on any failure we return a friendly JSON error.
//
// API notes (verified against node_modules):
//   - Next 16.2.2 fork: dynamic route params are async, so we `await ctx.params`
//     (see node_modules/next/dist/docs/.../15-route-handlers.md, RouteContext).
//   - ai v6: StreamTextResult exposes toUIMessageStreamResponse() (used here) and
//     toTextStreamResponse() as a fallback.

import { getUserAndOrg } from "@/lib/auth";
import {
  streamAgent,
  isAgentRuntimeOnline,
  OFFLINE_REPLY,
} from "@/lib/agents/run";
import { getAgent } from "@/lib/agents/agents";
import type { AgentChatMessage } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = {
  messages?: Array<{ role?: string; content?: unknown }>;
};

// Coerce arbitrary client input into the AgentChatMessage[] the runtime expects,
// dropping anything malformed. Never throws.
function normalizeMessages(input: ChatBody["messages"]): AgentChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: AgentChatMessage[] = [];
  for (const m of input) {
    const role = m?.role;
    const content = m?.content;
    if (
      (role === "user" || role === "assistant" || role === "system") &&
      typeof content === "string" &&
      content.length > 0
    ) {
      out.push({ role, content });
    }
  }
  return out;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    // Dynamic route params are async in this Next fork.
    const { id } = await ctx.params;

    const agent = getAgent(id);
    if (!agent) {
      return Response.json(
        { error: `Unknown agent "${id}".` },
        { status: 404 },
      );
    }

    let body: ChatBody = {};
    try {
      body = (await req.json()) as ChatBody;
    } catch {
      body = {};
    }
    const messages = normalizeMessages(body.messages);
    if (messages.length === 0) {
      return Response.json(
        { error: "No messages provided." },
        { status: 400 },
      );
    }

    // Resolve the caller's org; fall back to a demo org so chat works in dev
    // before Supabase is configured.
    const { org } = await getUserAndOrg();
    const orgId = org?.id ?? "demo";
    const orgName = org?.name ?? "Your business";

    // Offline (no ANTHROPIC_API_KEY): return the canned reply as plain text so
    // the client renders a normal assistant message instead of erroring.
    if (!isAgentRuntimeOnline()) {
      return new Response(OFFLINE_REPLY, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const result = await streamAgent({
      orgId,
      agentId: id,
      messages,
      orgName,
    });

    // Defensive: streamAgent returns null only when offline/unknown, both
    // handled above, but guard anyway so we never crash the route.
    if (!result) {
      return new Response(OFFLINE_REPLY, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ai v6: prefer the UI message stream (rich parts incl. tool calls).
    return result.toUIMessageStreamResponse();
  } catch {
    return Response.json(
      { error: "Agent chat failed. Please try again." },
      { status: 500 },
    );
  }
}
