// GET /api/app/knowledge  -> the org's knowledge docs (RAG sources)
// POST /api/app/knowledge -> { title, source } add a doc (enters processing)
//
// Reads/writes via the resilient data layer (src/lib/db/knowledge.ts): returns
// DEMO docs when Supabase is unconfigured. addKnowledge always returns a
// believable row (status "processing") even in demo mode so the UI can show the
// doc entering the pipeline immediately; ok:false signals it was not persisted.
//
// FORK NOTE: standard App Router route-handler conventions. Verified against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import { listKnowledge, addKnowledge } from "@/lib/db/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function effectiveOrgId(): Promise<string> {
  const { org } = await getUserAndOrg();
  return org?.id ?? "demo-org";
}

export async function GET(): Promise<Response> {
  const orgId = await effectiveOrgId();
  const docs = await listKnowledge(orgId);
  return Response.json({ docs });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "invalid json" }, { status: 400 });
  }

  const title =
    body && typeof body === "object" ? (body as { title?: unknown }).title : null;
  if (typeof title !== "string" || title.trim().length === 0) {
    return Response.json(
      { ok: false, reason: "title required" },
      { status: 400 },
    );
  }
  const sourceRaw =
    body && typeof body === "object" ? (body as { source?: unknown }).source : null;
  const source = typeof sourceRaw === "string" && sourceRaw.trim() ? sourceRaw.trim() : undefined;

  const orgId = await effectiveOrgId();
  const result = await addKnowledge(orgId, { title: title.trim(), source });
  return Response.json(result);
}
