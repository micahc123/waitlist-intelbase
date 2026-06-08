// Calendar data API for the /app work shell.
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET` returning `Response`). This repo runs a modified Next.js fork
// whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET ?from=&to= -> { events, upcoming }   (window events + an upcoming list)
//
// Thin wrapper: all logic lives in src/lib/db/calendar.ts. Reads fall back to
// deterministic DEMO data when Supabase is unconfigured or empty so the
// calendar stays populated with no keys. Reads org via getUserAndOrg().

import { getUserAndOrg } from "@/lib/auth";
import { listEvents, upcomingEvents } from "@/lib/db/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  const [events, upcoming] = await Promise.all([
    listEvents(orgId, { from, to }),
    upcomingEvents(orgId, 6),
  ]);
  return Response.json({ events, upcoming });
}
