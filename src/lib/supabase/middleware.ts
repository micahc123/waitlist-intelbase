// Session refresh + auth-gate helper, called from the fork's proxy.ts (this
// version of Next.js renamed `middleware` -> `proxy`; the runtime behavior is
// identical). This is the standard @supabase/ssr middleware pattern adapted to
// the fork.
//
// IMPORTANT (per @supabase/ssr docs): do not run logic between createServerClient
// and supabase.auth.getUser(). getUser() revalidates the auth token with the
// Supabase server on every request and is what keeps the session fresh.
//
// We keep `supabaseResponse` as the response object so the refreshed cookies are
// always written back to the browser. When we redirect, we copy those cookies
// onto the redirect response too.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require an authenticated user. Subscription/plan gating is added
// LATER by the Stripe agent; for now we only auth-gate.
const PROTECTED_PREFIXES = ["/app", "/onboarding"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase is not configured yet (no env), skip all auth handling so the
  // public site stays up. Auth activates automatically once the keys are set.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do NOT add code between client creation and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);

    const redirectResponse = NextResponse.redirect(url);
    // Preserve refreshed auth cookies on the redirect.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
