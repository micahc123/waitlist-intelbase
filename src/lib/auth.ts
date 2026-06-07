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

export async function getUser(): Promise<User | null> {
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

  return { user, org: (org as Organization | null) ?? null };
}

export async function requireUser(): Promise<User | null> {
  return getUser();
}
