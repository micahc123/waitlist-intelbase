// Data access for the Automations / workflow rules surface.
//
// Resilience contract: see src/lib/db/leads.ts. Automation lists fall back to
// demo when empty so the surface stays populated in the early product state.
// Writes no-op gracefully (return { ok: false }) when unconfigured and never
// throw.

import { createClient } from "@/lib/supabase/server";
import { demoAutomations } from "./demo";
import type { Automation, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function listAutomations(
  orgId: string | null,
): Promise<Automation[]> {
  if (!orgId || !configured()) return demoAutomations();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return demoAutomations();
    return data as Automation[];
  } catch {
    return demoAutomations();
  }
}

export async function toggleAutomation(
  orgId: string | null,
  id: string,
  enabled: boolean,
): Promise<WriteResult> {
  if (!orgId || !configured()) {
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
  if (!orgId || !configured()) {
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
