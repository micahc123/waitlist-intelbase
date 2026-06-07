// Data access for the Leads / CRM surface.
//
// Resilience contract (shared by every module in src/lib/db):
//   - Reads return DEMO data when there is no org, Supabase is unconfigured, the
//     query errors, OR the table is empty. Leads should stay populated in the
//     early product state, so an empty result also falls back to demo.
//   - Writes no-op gracefully (return { ok: false }) when unconfigured and never
//     throw.

import { createClient } from "@/lib/supabase/server";
import { demoLeads } from "./demo";
import type { Lead, LeadStage, LeadStageCounts, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const ALL_STAGES: LeadStage[] = ["new", "qualified", "booked", "won", "lost"];

function emptyStageCounts(): LeadStageCounts {
  return { new: 0, qualified: 0, booked: 0, won: 0, lost: 0 };
}

export async function listLeads(orgId: string | null): Promise<Lead[]> {
  if (!orgId || !configured()) return demoLeads();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return demoLeads();
    return data as Lead[];
  } catch {
    return demoLeads();
  }
}

export async function leadStageCounts(
  orgId: string | null,
): Promise<LeadStageCounts> {
  const leads = await listLeads(orgId);
  const counts = emptyStageCounts();
  for (const lead of leads) {
    if (ALL_STAGES.includes(lead.stage)) counts[lead.stage] += 1;
  }
  return counts;
}

export async function pipelineValue(orgId: string | null): Promise<number> {
  const leads = await listLeads(orgId);
  // Pipeline = open opportunities (everything not lost). Won is realized value
  // but still counts toward total pipeline shown on the board.
  return leads
    .filter((l) => l.stage !== "lost")
    .reduce((sum, l) => sum + (l.value_cents ?? 0), 0);
}

export async function updateLeadStage(
  orgId: string | null,
  id: string,
  stage: LeadStage,
): Promise<WriteResult> {
  if (!orgId || !configured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("leads")
      .update({ stage, updated_at: new Date().toISOString() })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
