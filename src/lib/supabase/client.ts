// Browser Supabase client (used in Client Components).
//
// Follows @supabase/ssr best practices: createBrowserClient reads the public
// URL + anon key from NEXT_PUBLIC_* env vars. These are safe to ship to the
// browser. We intentionally do NOT throw at import time when the env vars are
// missing so the app still compiles/builds before the human wires real values
// (placeholders are fine; auth simply will not function until set). See
// HANDBACK for the required env + schema steps.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
