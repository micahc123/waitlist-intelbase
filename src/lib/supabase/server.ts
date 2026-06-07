// Server Supabase client (used in Server Components, Server Actions, and Route
// Handlers).
//
// FORK NOTE: this Next.js fork (16.2.2) keeps the async `cookies()` API from
// next/headers (see node_modules/next/dist/docs/01-app/.../functions/cookies.md):
// `cookies()` returns a Promise and must be awaited. We follow the standard
// @supabase/ssr pattern: pass getAll/setAll wired to the Next cookie store.
//
// Setting cookies during a Server Component render throws (cookies can only be
// written in a Server Action or Route Handler). We swallow that specific failure
// in setAll because session refresh is handled centrally in proxy.ts
// (the fork's renamed middleware) -- so a read-only render is safe.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render where writing cookies is not
            // allowed. Safe to ignore: proxy.ts refreshes the session cookie.
          }
        },
      },
    },
  );
}
