// Leads / CRM data API for the /app work shell.
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET`/`POST` returning `Response`). This repo runs a modified Next.js
// fork whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET   -> { leads, counts, pipelineValueCents }   (table rows + header pills)
// POST  { id, stage } -> { ok, reason? }            (move a lead to a new stage)
//
// Thin wrapper: all logic lives in src/lib/db/leads.ts. Reads fall back to
// deterministic DEMO data when Supabase is unconfigured or empty (so the CRM
// stays populated with no keys); the stage write no-ops gracefully (ok:false)
// when unconfigured, which the client treats as an optimistic, local-only move.
// Reads org via getUserAndOrg() (demo-org default).

import { getUserAndOrg } from "@/lib/auth";
import {
  leadStageCounts,
  listLeads,
  pipelineValue,
  updateLeadStage,
} from "@/lib/db/leads";
import type { LeadStage } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAGES: LeadStage[] = ["new", "qualified", "booked", "won", "lost"];

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const [leads, counts, pipelineValueCents] = await Promise.all([
    listLeads(orgId),
    leadStageCounts(orgId),
    pipelineValue(orgId),
  ]);
  return Response.json({ leads, counts, pipelineValueCents });
}

export async function POST(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  let body: { id?: unknown; stage?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  const stage = body.stage as LeadStage;
  if (!id || !STAGES.includes(stage)) {
    return Response.json(
      { ok: false, reason: "invalid_input" },
      { status: 400 },
    );
  }

  const result = await updateLeadStage(orgId, id, stage);
  return Response.json(result);
}
