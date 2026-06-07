// Data access for the Approvals surface and agent audit log (actions table).
//
// Resilience contract: see src/lib/db/leads.ts. Action lists fall back to demo
// when empty so the approvals queue and audit trail stay populated early on.

import { createClient } from "@/lib/supabase/server";
import { demoActions } from "./demo";
import type { ActionItem, ActionStatus, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function listActions(
  orgId: string | null,
  opts: { status?: ActionStatus } = {},
): Promise<ActionItem[]> {
  const { status } = opts;

  if (!orgId || !configured()) {
    const demo = demoActions();
    return status ? demo.filter((a) => a.status === status) : demo;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("actions")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const demo = demoActions();
      return status ? demo.filter((a) => a.status === status) : demo;
    }
    return data as ActionItem[];
  } catch {
    const demo = demoActions();
    return status ? demo.filter((a) => a.status === status) : demo;
  }
}

export async function pendingCount(orgId: string | null): Promise<number> {
  const pending = await listActions(orgId, { status: "pending" });
  return pending.length;
}

export async function decideAction(
  orgId: string | null,
  id: string,
  decision: "approved" | "rejected",
  by: string,
): Promise<WriteResult> {
  if (!orgId || !configured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("actions")
      .update({
        status: decision,
        decided_at: new Date().toISOString(),
        decided_by: by,
      })
      .eq("org_id", orgId)
      .eq("id", id)
      .eq("status", "pending"); // only undecided actions can be decided
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
