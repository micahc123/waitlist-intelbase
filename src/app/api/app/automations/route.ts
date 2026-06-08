// Automations / workflow rules data API for the /app work shell.
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET`/`POST` returning `Response`). This repo runs a modified Next.js
// fork whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET  -> { automations }
// POST { op: "toggle", id, enabled }                       (enable/disable a rule)
// POST { op: "create", name, trigger?, steps?, enabled? }  (add a new rule)
//
// Thin wrapper: all logic lives in src/lib/db/automations.ts. Reads fall back
// to deterministic DEMO data when Supabase is unconfigured or empty; writes
// no-op gracefully (ok:false) when unconfigured, which the client treats as an
// optimistic, local-only change. Reads org via getUserAndOrg() (demo-org).

import { getUserAndOrg } from "@/lib/auth";
import {
  createAutomation,
  listAutomations,
  toggleAutomation,
} from "@/lib/db/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const automations = await listAutomations(orgId);
  return Response.json({ automations });
}

export async function POST(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const op = body.op;

  if (op === "toggle") {
    const id = typeof body.id === "string" ? body.id : null;
    const enabled = Boolean(body.enabled);
    if (!id) {
      return Response.json(
        { ok: false, reason: "invalid_input" },
        { status: 400 },
      );
    }
    const result = await toggleAutomation(orgId, id, enabled);
    return Response.json(result);
  }

  if (op === "create") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return Response.json(
        { ok: false, reason: "invalid_input" },
        { status: 400 },
      );
    }
    const trigger =
      body.trigger && typeof body.trigger === "object"
        ? (body.trigger as Record<string, unknown>)
        : {};
    const steps = Array.isArray(body.steps)
      ? (body.steps as Array<Record<string, unknown>>)
      : [];
    const result = await createAutomation(orgId, {
      name,
      trigger,
      steps,
      enabled: true,
    });
    return Response.json(result);
  }

  return Response.json({ ok: false, reason: "unknown_op" }, { status: 400 });
}
