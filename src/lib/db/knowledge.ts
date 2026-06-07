// Data access for the Knowledge surface (knowledge_docs table).
//
// Resilience contract: see src/lib/db/leads.ts. The doc list falls back to demo
// when empty so the knowledge base looks ingested in the early product state.

import { createClient } from "@/lib/supabase/server";
import { demoKnowledge } from "./demo";
import type { KnowledgeDoc, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function listKnowledge(
  orgId: string | null,
): Promise<KnowledgeDoc[]> {
  if (!orgId || !configured()) return demoKnowledge();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge_docs")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return demoKnowledge();
    return data as KnowledgeDoc[];
  } catch {
    return demoKnowledge();
  }
}

// Returns a WriteResult plus the created (or simulated) row. In demo mode the
// write no-ops but we still return a believable fake row so the UI can show the
// new doc entering processing immediately.
export async function addKnowledge(
  orgId: string | null,
  input: { title: string; source?: string },
): Promise<WriteResult & { doc: KnowledgeDoc }> {
  const fakeDoc: KnowledgeDoc = {
    id: `kdoc-demo-${Date.now()}`,
    org_id: orgId ?? "demo-org",
    title: input.title,
    source: input.source ?? "upload",
    status: "processing",
    chunks: 0,
    created_at: new Date().toISOString(),
  };

  if (!orgId || !configured()) {
    return { ok: false, reason: "unconfigured", doc: fakeDoc };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge_docs")
      .insert({
        org_id: orgId,
        title: input.title,
        source: input.source ?? "upload",
        status: "processing",
        chunks: 0,
      })
      .select("*")
      .maybeSingle();
    if (error || !data) {
      return { ok: false, reason: error?.message ?? "insert failed", doc: fakeDoc };
    }
    return { ok: true, doc: data as KnowledgeDoc };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "error",
      doc: fakeDoc,
    };
  }
}
