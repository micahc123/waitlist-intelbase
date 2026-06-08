// Data access for the Agents config surface (agent_configs table).
//
// Resilience contract: see src/lib/db/leads.ts. Demo configs only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own configs, even when empty; query errors return the
// empty equivalent ([] / null), not demo. Writes no-op gracefully when
// unconfigured.

import { createClient } from "@/lib/supabase/server";
import { demoAgentConfigs } from "./demo";
import type { AgentConfig, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listAgentConfigs(
  orgId: string | null,
): Promise<AgentConfig[]> {
  if (isDemoContext(orgId)) return demoAgentConfigs();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("org_id", orgId)
      .order("agent_id", { ascending: true });
    if (error) return [];
    return (data as AgentConfig[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function getAgentConfig(
  orgId: string | null,
  agentId: string,
): Promise<AgentConfig | null> {
  if (isDemoContext(orgId)) {
    return demoAgentConfigs().find((c) => c.agent_id === agentId) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("org_id", orgId)
      .eq("agent_id", agentId)
      .maybeSingle();
    if (error || !data) return null;
    return data as AgentConfig;
  } catch {
    return null;
  }
}

// Partial update or insert (upsert) of a single agent's config. The unique
// (org_id, agent_id) constraint backs the upsert.
export async function saveAgentConfig(
  orgId: string | null,
  agentId: string,
  patch: Partial<
    Pick<AgentConfig, "enabled" | "autonomy" | "instructions" | "guardrails">
  >,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("agent_configs").upsert(
      {
        org_id: orgId,
        agent_id: agentId,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id,agent_id" },
    );
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

// Global pause / resume: set enabled on every config for the org. Demo no-op.
export async function pauseAllAgents(
  orgId: string | null,
  paused: boolean,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("agent_configs")
      .update({ enabled: !paused, updated_at: new Date().toISOString() })
      .eq("org_id", orgId);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
