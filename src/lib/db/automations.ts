// Data access for the Automations / workflow rules surface.
//
// Resilience contract: see src/lib/db/leads.ts. Demo automations only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own automations, even when empty; query errors return
// the empty equivalent, not demo. Writes no-op gracefully (return
// { ok: false }) when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { demoAutomations } from "./demo";
import type { Automation, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listAutomations(
  orgId: string | null,
): Promise<Automation[]> {
  if (isDemoContext(orgId)) return demoAutomations();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as Automation[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function toggleAutomation(
  orgId: string | null,
  id: string,
  enabled: boolean,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("automations")
      .update({ enabled })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function createAutomation(
  orgId: string | null,
  payload: {
    name: string;
    trigger?: Record<string, unknown>;
    steps?: Array<Record<string, unknown>>;
    enabled?: boolean;
  },
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("automations").insert({
      org_id: orgId,
      name: payload.name,
      trigger: payload.trigger ?? {},
      steps: payload.steps ?? [],
      enabled: payload.enabled ?? true,
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
