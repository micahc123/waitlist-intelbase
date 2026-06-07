// Approvals data + decisions for the /app work shell (human-in-the-loop).
//
// GET  /api/app/approvals?status=pending  -> the pending queue
// GET  /api/app/approvals?status=approved -> filtered audit trail
// GET  /api/app/approvals                 -> all actions, newest first
// POST /api/app/approvals  { id, decision: 'approve' | 'reject' }
//      -> records the human's decision via the data layer.
//
// Reads always succeed (the data layer falls back to realistic DEMO data when
// Supabase is unconfigured or empty). Writes no-op gracefully when unconfigured:
// decideAction returns { ok: false, reason: 'unconfigured' } and we surface that
// so the client can keep its optimistic UI in demo mode without erroring.
//
// VERIFY AGAINST FORK: standard App Router route handler (named GET/POST
// returning Response, force-dynamic). Confirmed against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import { decideAction, listActions } from "@/lib/db/approvals";
import type { ActionStatus } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS: ActionStatus[] = ["pending", "approved", "rejected", "auto"];

export async function GET(request: Request): Promise<Response> {
  const { user, org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && VALID_STATUS.includes(statusParam as ActionStatus)
      ? (statusParam as ActionStatus)
      : undefined;

  const actions = await listActions(orgId, status ? { status } : {});

  return Response.json({
    actions,
    by: user?.email ?? "You",
  });
}

export async function POST(request: Request): Promise<Response> {
  const { user, org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";
  const by = user?.email ?? "You";

  let body: { id?: unknown; decision?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  const rawDecision = body.decision;

  // Accept both the verb form ('approve'/'reject') and the stored status form
  // ('approved'/'rejected') so the client can send either.
  let decision: "approved" | "rejected" | null = null;
  if (rawDecision === "approve" || rawDecision === "approved") decision = "approved";
  else if (rawDecision === "reject" || rawDecision === "rejected") decision = "rejected";

  if (!id || !decision) {
    return Response.json(
      { ok: false, reason: "id and decision ('approve' | 'reject') are required" },
      { status: 400 },
    );
  }

  const result = await decideAction(orgId, id, decision, by);

  // In demo mode the write is a no-op (reason: 'unconfigured'). That is expected,
  // not a server error: return 200 with demo:true so the client keeps its
  // optimistic removal. Real DB failures (e.g. a Supabase error) return 500.
  if (!result.ok && result.reason === "unconfigured") {
    return Response.json({ ok: true, demo: true, decision, id, by });
  }
  if (!result.ok) {
    return Response.json(
      { ok: false, reason: result.reason ?? "error" },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, decision, id, by });
}
