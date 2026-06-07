"use server";

// Onboarding Server Functions. Each one is resilient: if Supabase env is not
// configured (no signed-in user / org), it becomes a safe no-op and returns
// { ok: true } so the client wizard keeps working in dev/preview. Nothing here
// ever throws to the client -- every DB call is wrapped.
//
// `getUserAndOrg()` already returns { user: null, org: null } when Supabase env
// is missing (see src/lib/auth.ts), so the no-op path falls out naturally.

import { getUserAndOrg } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean };

// Step 1: persist the business name onto the caller's organization row.
export async function saveBusiness(name: string): Promise<ActionResult> {
  try {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) return { ok: true };

    const { org } = await getUserAndOrg();
    if (!org) return { ok: true }; // unconfigured / logged-out: no-op

    const supabase = await createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ name: trimmed })
      .eq("id", org.id);

    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

// Step 2: record which integrations the user "connected". The connections table
// has no unique (org_id, provider) constraint, so we clear the chosen providers
// for this org and re-insert them as connected. Providers not in `ids` are left
// untouched.
export async function saveConnections(ids: string[]): Promise<ActionResult> {
  try {
    const providers = Array.isArray(ids)
      ? ids.map((id) => String(id)).filter(Boolean)
      : [];
    if (providers.length === 0) return { ok: true };

    const { org } = await getUserAndOrg();
    if (!org) return { ok: true }; // unconfigured / logged-out: no-op

    const supabase = await createClient();

    // Remove any existing rows for these providers, then insert fresh ones so we
    // do not create duplicates on repeat visits.
    await supabase
      .from("connections")
      .delete()
      .eq("org_id", org.id)
      .in("provider", providers);

    const rows = providers.map((provider) => ({
      org_id: org.id,
      provider,
      connected: true,
      meta: {},
    }));

    const { error } = await supabase.from("connections").insert(rows);
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

// Final step (used on the dev/preview path when billing is not configured):
// mark the org as onboarded so /onboarding redirects to /app next time.
export async function completeOnboarding(): Promise<ActionResult> {
  try {
    const { org } = await getUserAndOrg();
    if (!org) return { ok: true }; // unconfigured / logged-out: no-op

    const supabase = await createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ onboarded: true })
      .eq("id", org.id);

    return { ok: !error };
  } catch {
    return { ok: false };
  }
}
