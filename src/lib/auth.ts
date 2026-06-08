// Server-side auth helpers built on the @supabase/ssr server client.
//
// getUser()        -> the current authenticated user, or null.
// getUserAndOrg()  -> { user, org } where org is the caller's organization row
//                     (the one they own) or null. Used by onboarding / the app.
// requireUser()    -> returns the user, or null; callers decide how to redirect
//                     (the proxy already hard-gates /app and /onboarding, so this
//                     is a convenience for server components/actions).
//
// All of these are safe to call before real Supabase env is set: getUser()
// simply resolves to null, so pages render a logged-out state instead of
// throwing at build time.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
// supabase-js re-exports the auth user type as `AuthUser` (not `User`).
import type { AuthUser as User } from "@supabase/supabase-js";

export type Organization = {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  onboarded: boolean;
  created_at: string;
};

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getUser(): Promise<User | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getUserAndOrg(): Promise<{
  user: User | null;
  org: Organization | null;
}> {
  if (!supabaseConfigured()) return { user: null, org: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, org: null };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (org) return { user, org: org as Organization };

  // The user is authenticated but has no organization (the signup trigger did
  // not run, e.g. they signed up before the schema existed). Create a REAL org
  // now so an authenticated user NEVER falls back to the demo path / demo data.
  return { user, org: await ensureOrg(user) };
}

async function ensureOrg(user: User): Promise<Organization | null> {
  const fallbackName =
    (user.email ? user.email.split("@")[0].replace(/[._-]+/g, " ") : "") ||
    "My business";

  // Prefer the service-role client so the insert reliably bypasses RLS.
  const admin = createAdminClient();
  try {
    if (admin) {
      const { data: again } = await admin
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();
      if (again) return again as Organization;
      const { data: created } = await admin
        .from("organizations")
        .insert({ owner_id: user.id, name: fallbackName, onboarded: false })
        .select("*")
        .single();
      return (created as Organization) ?? null;
    }
    // No service-role key: try with the user-scoped client (needs an insert policy).
    const supabase = await createClient();
    const { data: created } = await supabase
      .from("organizations")
      .insert({ owner_id: user.id, name: fallbackName, onboarded: false })
      .select("*")
      .maybeSingle();
    return (created as Organization | null) ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User | null> {
  return getUser();
}
