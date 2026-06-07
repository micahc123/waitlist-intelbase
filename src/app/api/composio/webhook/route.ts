// POST /api/composio/webhook
//
// Receives Composio TRIGGER events (e.g. a new Gmail message, a new calendar
// event) and fires the relevant agent so the OS acts autonomously. Composio
// maps each ORG to a user/entity (we use org.id as the Composio userId, see
// src/lib/integrations/composio.ts), so the event's user/entity id IS our orgId.
//
// FLOW:
//   1. Read the RAW body (needed for optional signature verification).
//   2. If COMPOSIO_WEBHOOK_SECRET is set, verify the signature header
//      (best-effort HMAC-SHA256 over the raw body). If absent, accept.
//   3. Parse the trigger -> figure out the toolkit/trigger type, the entity id
//      (our orgId), and a human summary of the event.
//   4. Map the trigger to an agent (gmail -> inbox, calendar -> scheduler,
//      default -> ops) and fire runAgent() FIRE-AND-FORGET. runAgent already
//      persists to memory and no-ops gracefully with no ANTHROPIC_API_KEY.
//   5. Always return 200 { ok: true } quickly. We never block on the run and
//      never throw.
//
// FORK NOTE: signature verification needs the unparsed body, so we read
// request.text() (not request.json()), per the fork's route-handler docs
// (15-route-handlers.md). nodejs runtime is required for crypto.

import { createHmac, timingSafeEqual } from "node:crypto";
import { runAgent } from "@/lib/agents/run";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgentId = "inbox" | "scheduler" | "ops";

// Best-effort HMAC-SHA256 signature check. Composio signs the raw body; the
// header name/format can vary, so we accept the common variants and compare
// constant-time. Returns true when valid OR when we genuinely cannot verify
// (no header at all) so a misconfigured-but-trusted source is not silently
// dropped; a present-but-wrong signature is rejected.
function verifySignature(
  rawBody: string,
  secret: string,
  headers: Headers,
): boolean {
  const provided =
    headers.get("x-composio-signature") ??
    headers.get("webhook-signature") ??
    headers.get("x-signature") ??
    "";
  if (!provided) return true; // no signature header -> cannot verify, accept.

  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    // The header may be "sha256=<hex>" or include multiple space/comma values.
    const candidates = provided
      .split(/[\s,]+/)
      .map((p) => p.replace(/^sha256=/i, "").trim())
      .filter(Boolean);
    const want = Buffer.from(expected, "hex");
    for (const c of candidates) {
      try {
        const got = Buffer.from(c, "hex");
        if (got.length === want.length && timingSafeEqual(got, want)) {
          return true;
        }
      } catch {
        /* malformed candidate; try the next */
      }
    }
    return false;
  } catch {
    // If hashing itself fails, fail open rather than crash; the route stays 200.
    return true;
  }
}

// Dig a value out of a loosely-typed payload by trying several key paths.
function pick(obj: unknown, paths: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const path of paths) {
    let cur: unknown = obj;
    let ok = true;
    for (const key of path.split(".")) {
      if (cur && typeof cur === "object" && key in (cur as object)) {
        cur = (cur as Record<string, unknown>)[key];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && (typeof cur === "string" || typeof cur === "number")) {
      const s = String(cur).trim();
      if (s) return s;
    }
  }
  return undefined;
}

// Resolve the org/entity id from the Composio event. We use org.id as the
// Composio userId, so the entity/user id on the event IS our orgId.
function resolveOrgId(event: Record<string, unknown>): string | undefined {
  const data = (event.data ?? event.payload ?? {}) as Record<string, unknown>;
  return (
    pick(event, [
      "userId",
      "user_id",
      "entityId",
      "entity_id",
      "metadata.userId",
      "metadata.entityId",
      "metadata.connectedAccount.userId",
    ]) ??
    pick(data, [
      "userId",
      "user_id",
      "entityId",
      "entity_id",
      "connectedAccount.userId",
    ])
  );
}

// Derive a lowercase toolkit/trigger descriptor from the event for mapping.
function triggerTypeOf(event: Record<string, unknown>): string {
  const t =
    pick(event, [
      "type",
      "triggerName",
      "trigger_name",
      "triggerSlug",
      "trigger_slug",
      "toolkitSlug",
      "toolkit_slug",
      "appName",
      "app_name",
      "metadata.toolkitSlug",
      "metadata.triggerName",
    ]) ?? "";
  return t.toLowerCase();
}

// Map a trigger descriptor to the agent that should handle it.
function agentForTrigger(triggerType: string): AgentId {
  if (triggerType.includes("gmail") || triggerType.includes("email")) {
    return "inbox";
  }
  if (triggerType.includes("calendar") || triggerType.includes("event")) {
    return "scheduler";
  }
  return "ops";
}

// Build a short human prompt summarizing the event for the agent.
function promptForEvent(
  agentId: AgentId,
  triggerType: string,
  event: Record<string, unknown>,
): string {
  const data = (event.data ?? event.payload ?? {}) as Record<string, unknown>;

  if (agentId === "inbox") {
    const subject =
      pick(data, ["subject", "messageText", "snippet", "preview"]) ??
      "(no subject)";
    const from = pick(data, ["from", "sender", "fromEmail", "from_email"]);
    const who = from ? ` from ${from}` : "";
    return `A new email arrived${who}: "${subject}". Triage it by importance and intent, summarise what matters, and draft a clear reply for review. Do not send without approval.`;
  }

  if (agentId === "scheduler") {
    const title =
      pick(data, ["summary", "title", "subject", "eventName"]) ??
      "(untitled event)";
    const when = pick(data, ["start", "startTime", "start_time", "when"]);
    const at = when ? ` at ${when}` : "";
    return `A calendar event changed: "${title}"${at}. Review it for conflicts, confirm the details, and propose any reschedule if there is an overlap.`;
  }

  const summary =
    pick(data, ["summary", "title", "subject", "messageText", "text"]) ||
    triggerType ||
    "an event";
  return `A new ${triggerType || "trigger"} event fired: "${summary}". Decide what action it requires, take the appropriate steps, and report a crisp summary of what you did.`;
}

// Look up the org's display name (best-effort, never throws).
async function orgNameFor(orgId: string): Promise<string | undefined> {
  try {
    const admin = createAdminClient();
    if (!admin) return undefined;
    const { data } = await admin
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .limit(1)
      .maybeSingle();
    const name = (data as { name?: string } | null)?.name;
    return name?.trim() || undefined;
  } catch {
    return undefined;
  }
}

// Fire the mapped agent in the background. Awaited internally but the caller
// does NOT await this, so the 200 returns immediately. Never throws.
async function fireAgent(event: Record<string, unknown>): Promise<void> {
  try {
    const orgId = resolveOrgId(event);
    if (!orgId) return; // cannot route without an entity/org id.

    const triggerType = triggerTypeOf(event);
    const agentId = agentForTrigger(triggerType);
    const content = promptForEvent(agentId, triggerType, event);
    const orgName = await orgNameFor(orgId);

    // runAgent persists to memory and no-ops gracefully with no ANTHROPIC_API_KEY.
    await runAgent({
      orgId,
      agentId,
      messages: [{ role: "user", content }],
      orgName,
    });
  } catch {
    // best-effort autonomous run; swallow everything.
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();

    const secret = process.env.COMPOSIO_WEBHOOK_SECRET;
    if (secret && !verifySignature(rawBody, secret, request.headers)) {
      // Present-but-invalid signature: reject. Still a quick, non-throwing exit.
      return Response.json({ ok: false }, { status: 401 });
    }

    let event: Record<string, unknown> = {};
    try {
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      if (parsed && typeof parsed === "object") {
        event = parsed as Record<string, unknown>;
      }
    } catch {
      event = {};
    }

    // Fire-and-forget the agent run so we never block the 200. The promise is
    // intentionally not awaited.
    void fireAgent(event);

    return Response.json({ ok: true });
  } catch {
    // Resilience: acknowledge even on unexpected failure so Composio does not
    // retry-storm a route that cannot recover.
    return Response.json({ ok: true });
  }
}
