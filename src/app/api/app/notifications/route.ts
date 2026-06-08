// Notifications feed for the /app work shell topbar bell.
//
// GET  -> { notifications, unread }   (newest-first list + unread count)
// POST { op: 'read', id } -> mark one read
// POST { op: 'readAll' }  -> mark all read
//
// Thin wrapper over src/lib/db/notifications.ts. Reads fall back to deterministic
// DEMO data when Supabase is unconfigured or empty (so the bell stays populated
// with no keys). Writes no-op gracefully (the data layer returns
// { ok: false, reason: 'unconfigured' }); we surface that as { ok: true, demo:
// true } so the client keeps its optimistic UI in demo mode.
//
// VERIFY AGAINST FORK: standard App Router route handler (named GET/POST
// returning Response, force-dynamic). Confirmed against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from "@/lib/db/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const [notifications, unread] = await Promise.all([
    listNotifications(orgId),
    unreadCount(orgId),
  ]);
  return Response.json({ notifications, unread });
}

export async function POST(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  let body: { op?: unknown; id?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const op = body.op;
  if (op === "readAll") {
    const result = await markAllRead(orgId);
    if (!result.ok && result.reason === "unconfigured") {
      return Response.json({ ok: true, demo: true });
    }
    if (!result.ok) {
      return Response.json(
        { ok: false, reason: result.reason ?? "error" },
        { status: 500 },
      );
    }
    return Response.json({ ok: true });
  }

  if (op === "read") {
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) {
      return Response.json(
        { ok: false, reason: "id_required" },
        { status: 400 },
      );
    }
    const result = await markRead(orgId, id);
    if (!result.ok && result.reason === "unconfigured") {
      return Response.json({ ok: true, demo: true, id });
    }
    if (!result.ok) {
      return Response.json(
        { ok: false, reason: result.reason ?? "error" },
        { status: 500 },
      );
    }
    return Response.json({ ok: true, id });
  }

  return Response.json(
    { ok: false, reason: "op must be 'read' or 'readAll'" },
    { status: 400 },
  );
}
