// The MEMORY layer API: store and retrieve agent long-term memory.
//
// This backs the AI agents (RAG over past conversations/records) and the
// "Memory Cortex" dashboard view.
//
//   remember(orgId, input)            -> embed + insert a memory row
//   recall(orgId, query, k)           -> top-k memories by cosine similarity
//   recentMemories(orgId, { kind })   -> plain recent rows (no vector)
//   memoryStats(orgId)                -> counts for the Cortex HUD
//
// RESILIENCE (critical): nothing here throws. Writes/stats go through the
// service-role admin client so server actions and webhooks can persist memory
// without a user session. When the admin client is unavailable (Supabase env
// missing) or embeddings are unconfigured (no OPENAI_API_KEY), each function
// degrades to a safe empty result:
//   - remember -> { ok: false } (stores without an embedding if Supabase is up
//                  but OpenAI is not; skips entirely if Supabase is down)
//   - recall   -> []  (needs an embedding to search)
//   - recentMemories / memoryStats -> [] / zeros
//
// Embeddings are stored as the raw number[]; supabase-js serialises it and
// pgvector accepts the JSON array form for the vector(1536) column.

import { createAdminClient } from "@/lib/supabase/admin";
import { embedText } from "@/lib/memory/embeddings";
import type { MemoryInput, MemoryRecord } from "@/lib/memory/types";

// ---------------------------------------------------------------------------
// remember: persist a memory (with an embedding when OpenAI is configured).
// ---------------------------------------------------------------------------
export async function remember(
  orgId: string,
  input: MemoryInput,
): Promise<{ ok: boolean; id?: string }> {
  try {
    if (!orgId || !input?.content?.trim()) return { ok: false };

    const admin = createAdminClient();
    // No service-role client -> cannot write at all. Silent no-op.
    if (!admin) return { ok: false };

    // Embed when possible; if unconfigured/failed this is null and we store the
    // row without a vector (it just will not surface in recall() until
    // re-embedded). This keeps writes working with no OpenAI key.
    const embedding = await embedText(input.content);

    const row = {
      org_id: orgId,
      kind: input.kind,
      source: input.source ?? null,
      title: input.title ?? null,
      content: input.content,
      embedding, // number[] | null
      metadata: input.metadata ?? {},
    };

    const { data, error } = await admin
      .from("memories")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) return { ok: false };
    return { ok: true, id: (data as { id: string }).id };
  } catch {
    return { ok: false };
  }
}

// ---------------------------------------------------------------------------
// recall: top-k memories for an org by cosine similarity to `query`.
// ---------------------------------------------------------------------------
export async function recall(
  orgId: string,
  query: string,
  k = 6,
): Promise<MemoryRecord[]> {
  try {
    if (!orgId || !query?.trim()) return [];

    // Searching needs an embedding for the query. No key -> nothing to match on.
    const queryEmbedding = await embedText(query);
    if (!queryEmbedding) return [];

    const admin = createAdminClient();
    if (!admin) return [];

    const { data, error } = await admin.rpc("match_memories", {
      p_org_id: orgId,
      p_query: queryEmbedding,
      p_k: k,
    });

    if (error || !data) return [];
    return data as MemoryRecord[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// recentMemories: plain recent rows for the Cortex list (no vector needed).
// ---------------------------------------------------------------------------
export async function recentMemories(
  orgId: string,
  opts: { kind?: string; limit?: number } = {},
): Promise<MemoryRecord[]> {
  try {
    if (!orgId) return [];

    const admin = createAdminClient();
    if (!admin) return [];

    const limit = opts.limit ?? 30;

    let q = admin
      .from("memories")
      .select("id, org_id, kind, source, title, content, metadata, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (opts.kind) q = q.eq("kind", opts.kind);

    const { data, error } = await q;
    if (error || !data) return [];
    return data as MemoryRecord[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// memoryStats: counts for the Cortex HUD (total + per-kind breakdown).
// ---------------------------------------------------------------------------
export async function memoryStats(
  orgId: string,
): Promise<{ total: number; byKind: Record<string, number> }> {
  const empty = { total: 0, byKind: {} as Record<string, number> };
  try {
    if (!orgId) return empty;

    const admin = createAdminClient();
    if (!admin) return empty;

    // Pull just the kind column for the org and tally client-side. Memory
    // volumes per org are small enough that this is fine for a HUD; swap for a
    // grouped SQL view later if needed.
    const { data, error } = await admin
      .from("memories")
      .select("kind")
      .eq("org_id", orgId);

    if (error || !data) return empty;

    const byKind: Record<string, number> = {};
    for (const r of data as { kind: string | null }[]) {
      const key = r.kind ?? "unknown";
      byKind[key] = (byKind[key] ?? 0) + 1;
    }
    return { total: data.length, byKind };
  } catch {
    return empty;
  }
}
