// GET  /api/app/team              -> { members: TeamMember[] }
// POST /api/app/team { op:"invite", email, role }  -> invite a new member
// POST /api/app/team { op:"role",   id,    role }  -> update an existing member's role
//
// When Supabase is unconfigured (demo mode) the GET returns the demo dataset and
// writes return a synthetic invited row so the UI can still demo the invite flow
// without throwing. The client is responsible for optimistic updates; we return
// the new/updated row on success.
//
// FORK NOTE: standard App Router route-handler conventions (named method exports
// returning Response). Verified against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import { listTeam, inviteTeamMember, updateMemberRole } from "@/lib/db/team";
import { demoTeam } from "@/lib/db/demo";
import type { TeamRole } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: TeamRole[] = ["owner", "admin", "member", "viewer"];

async function effectiveOrgId(): Promise<string> {
  const { org } = await getUserAndOrg();
  return org?.id ?? "demo-org";
}

export async function GET(): Promise<Response> {
  const orgId = await effectiveOrgId();
  const members = await listTeam(orgId);
  return Response.json({ members });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, reason: "body required" }, { status: 400 });
  }

  const { op } = body as { op?: unknown };

  // ---- Invite ---------------------------------------------------------------
  if (op === "invite") {
    const { email, role } = body as { email?: unknown; role?: unknown };

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, reason: "valid email required" }, { status: 400 });
    }
    if (typeof role !== "string" || !ROLES.includes(role as TeamRole)) {
      return Response.json({ ok: false, reason: "valid role required" }, { status: 400 });
    }

    const orgId = await effectiveOrgId();

    // Demo fallback: return a synthetic invited row so the UI can preview the
    // invite flow without a real database.
    if (orgId === "demo-org") {
      const now = new Date().toISOString();
      const demoRow = {
        id: `demo-invite-${Date.now()}`,
        org_id: "demo-org",
        email: email as string,
        name: null,
        role: role as TeamRole,
        status: "invited" as const,
        invited_at: now,
        created_at: now,
      };
      return Response.json({ ok: true, member: demoRow });
    }

    const result = await inviteTeamMember(orgId, {
      email: email as string,
      role: role as TeamRole,
    });
    if (!result.ok) {
      return Response.json(result, { status: 422 });
    }
    // Re-fetch the created row so we can return it.
    const members = await listTeam(orgId);
    const created = members.find((m) => m.email === email) ?? null;
    return Response.json({ ok: true, member: created });
  }

  // ---- Role change ----------------------------------------------------------
  if (op === "role") {
    const { id, role } = body as { id?: unknown; role?: unknown };

    if (typeof id !== "string" || !id) {
      return Response.json({ ok: false, reason: "id required" }, { status: 400 });
    }
    if (typeof role !== "string" || !ROLES.includes(role as TeamRole)) {
      return Response.json({ ok: false, reason: "valid role required" }, { status: 400 });
    }

    const orgId = await effectiveOrgId();

    // Demo fallback: role changes in demo mode are purely optimistic on the
    // client; we just acknowledge them here.
    if (orgId === "demo-org") {
      const demo = demoTeam().find((m) => m.id === id);
      if (!demo) {
        return Response.json({ ok: false, reason: "member not found" }, { status: 404 });
      }
      return Response.json({ ok: true });
    }

    const result = await updateMemberRole(orgId, id as string, role as TeamRole);
    if (!result.ok) {
      return Response.json(result, { status: 422 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, reason: "unknown op" }, { status: 400 });
}
