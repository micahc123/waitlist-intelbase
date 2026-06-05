// VERIFY AGAINST FORK: This uses STANDARD Next.js App Router route handler
// conventions (named `GET` export returning `Response`). This repo runs a
// modified/breaking Next.js fork whose docs live in node_modules/next/dist/docs/
// and were NOT readable when this was written. After `npm install`, CHECK the
// handler signature and the runtime/dynamic export conventions against the fork
// docs. Keep this file a THIN wrapper, all logic is in src/lib/agent/.
//
// Returns captured leads + aggregate metrics for the dashboard (DASH-02, reads
// real storage). NOTE: this endpoint exposes lead data, gate it behind auth before
// any public deploy (see README hand-back). Intentionally unauthenticated here so
// the dogfood dashboard works locally, flagged in the hand-back.

import { getLeadStore } from "@/lib/agent/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const store = getLeadStore();
  try {
    const [leads, metrics] = await Promise.all([
      store.list(),
      store.metrics(),
    ]);
    return Response.json({ metrics, leads });
  } catch (err) {
    return Response.json(
      {
        error: `Failed to read leads: ${(err as Error).message}`,
        metrics: { conversations: 0, qualified: 0, booked: 0 },
        leads: [],
      },
      { status: 500 }
    );
  }
}
