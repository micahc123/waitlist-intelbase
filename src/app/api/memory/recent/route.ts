// GET /api/memory/recent?limit=
//
// Returns the caller org's most recent stored memories for the Memory Cortex
// view. Resolves the org via getUserAndOrg(); with no session / no org / no
// Supabase, recentMemories() no-ops and we return an empty list so the Cortex
// falls back to its simulated sessions.
//
// RESILIENCE: never throws. Any failure resolves to { memories: [] }.

import { getUserAndOrg } from "@/lib/auth";
import { recentMemories } from "@/lib/memory/memory";
import type { MemoryRecord } from "@/lib/memory/types";

export const dynamic = "force-dynamic";

// Parse ?limit= into a sane bounded integer (default 60, max 200).
function parseLimit(url: string): number {
  try {
    const raw = new URL(url).searchParams.get("limit");
    const n = raw ? parseInt(raw, 10) : NaN;
    if (!Number.isFinite(n) || n <= 0) return 60;
    return Math.min(200, Math.floor(n));
  } catch {
    return 60;
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const limit = parseLimit(request.url);
    const { org } = await getUserAndOrg();
    if (!org?.id) {
      return Response.json({ memories: [] as MemoryRecord[] });
    }
    const memories = await recentMemories(org.id, { limit });
    return Response.json({ memories });
  } catch {
    return Response.json({ memories: [] as MemoryRecord[] });
  }
}
