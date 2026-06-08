// Data access for the Approvals surface and agent audit log (actions table).
//
// Resilience contract: see src/lib/db/leads.ts. Demo actions only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own actions, even when empty; query errors return the
// empty equivalent, not demo.

import { createClient } from "@/lib/supabase/server";
import { demoActions } from "./demo";
import type { ActionItem, ActionStatus, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listActions(
  orgId: string | null,
  opts: { status?: ActionStatus } = {},
): Promise<ActionItem[]> {
  const { status } = opts;

  if (isDemoContext(orgId)) {
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
    if (error) return [];
    return (data as ActionItem[] | null) ?? [];
  } catch {
    return [];
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
  if (!orgId || !supabaseConfigured()) {
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
