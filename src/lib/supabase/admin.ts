// Service-role Supabase client (server-only, bypasses RLS).
//
// Used by the Stripe webhook to write `subscriptions` rows without a user
// session (the webhook has no cookies / no signed-in user). NEVER import this
// into client components or expose the service-role key to the browser.
//
// Resilient by design: createAdminClient() returns null when the required env
// is missing, so importing this file never throws and the app still compiles
// with no Supabase/Stripe config set.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      // No session persistence / token refresh for a server-side admin client.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
