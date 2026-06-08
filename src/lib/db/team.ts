// Data access for the Team / members surface.
//
// Resilience contract: see src/lib/db/leads.ts. Team lists fall back to demo
// when empty so the surface stays populated in the early product state. Writes
// no-op gracefully (return { ok: false }) when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { demoTeam } from "./demo";
import type { TeamMember, TeamRole, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function listTeam(orgId: string | null): Promise<TeamMember[]> {
  if (!orgId || !configured()) return demoTeam();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return demoTeam();
    return data as TeamMember[];
  } catch {
    return demoTeam();
  }
}

export async function inviteTeamMember(
  orgId: string | null,
  payload: { email: string; role: TeamRole },
): Promise<WriteResult> {
  if (!orgId || !configured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").insert({
      org_id: orgId,
      email: payload.email,
      role: payload.role,
      status: "invited",
      invited_at: new Date().toISOString(),
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function updateMemberRole(
  orgId: string | null,
  id: string,
  role: TeamRole,
): Promise<WriteResult> {
  if (!orgId || !configured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
