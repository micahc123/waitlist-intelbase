// GET /api/memory/stats
//
// Returns the caller org's memory counts (total + per-kind) for the Memory
// Cortex HUD. The Brain view uses total > 0 to decide whether to render REAL
// memories or fall back to the simulated sessions.
//
// RESILIENCE: never throws. No session / no org / no Supabase -> zeros, which
// keeps the Cortex on its demo data.

import { getUserAndOrg } from "@/lib/auth";
import { memoryStats } from "@/lib/memory/memory";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const { org } = await getUserAndOrg();
    if (!org?.id) {
      return Response.json({ total: 0, byKind: {} });
    }
    const stats = await memoryStats(org.id);
    return Response.json(stats);
  } catch {
    return Response.json({ total: 0, byKind: {} });
  }
}
