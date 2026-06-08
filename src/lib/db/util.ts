// Shared gating for the data layer.
//
// Demo data is shown ONLY in a demo context: when there is no org, when the org
// is the public demo pass ("demo-org"), or when Supabase is not configured. A
// real, signed-in org (a real UUID) always runs the live query and gets its OWN
// data back, even when that data is empty.

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isDemoContext(orgId: string | null | undefined): boolean {
  return !orgId || orgId === "demo-org" || !supabaseConfigured();
}
