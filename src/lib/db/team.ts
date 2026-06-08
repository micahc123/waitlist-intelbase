// Data access for the Team / members surface.
//
// Resilience contract: see src/lib/db/leads.ts. Demo team only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own members, even when empty; query errors return the
// empty equivalent, not demo. Writes no-op gracefully (return { ok: false })
// when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { demoTeam } from "./demo";
import type { TeamMember, TeamRole, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listTeam(orgId: string | null): Promise<TeamMember[]> {
  if (isDemoContext(orgId)) return demoTeam();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data as TeamMember[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function inviteTeamMember(
  orgId: string | null,
  payload: { email: string; role: TeamRole },
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
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
  if (!orgId || !supabaseConfigured()) {
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
