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

// Routes that require an authenticated user.
const PROTECTED_PREFIXES = ["/app", "/onboarding"];

// Subset of protected routes that ALSO require an active subscription/trial.
// /onboarding is intentionally excluded so a signed-in user without a sub can
// still reach it to pick a plan and start their trial.
const SUBSCRIPTION_PREFIXES = ["/app"];

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

// Pure predicate mirrored from src/lib/billing.ts (kept inline here to avoid
// importing server-only helpers into the proxy/edge runtime). True only when a
// subscription is trialing/active and its trial/period has not expired.
function subRowGrantsAccess(sub: {
  status?: string | null;
  trial_end?: string | null;
  current_period_end?: string | null;
} | null): boolean {
  if (!sub || !sub.status || !ACTIVE_STATUSES.has(sub.status)) return false;
  const now = Date.now();
  if (sub.status === "trialing") {
    return sub.trial_end ? new Date(sub.trial_end).getTime() > now : true;
  }
  return sub.current_period_end
    ? new Date(sub.current_period_end).getTime() > now
    : true;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase is not configured yet (no env), skip all auth handling so the
  // public site stays up. Auth activates automatically once the keys are set.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // Demo pass: an `ib_demo` cookie (set via /api/demo) unlocks the gated app
  // without auth or a subscription, even when Supabase/Stripe are configured.
  if (request.cookies.get("ib_demo")?.value === "1") {
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

  // Subscription gating: a signed-in user hitting /app must have an active
  // subscription or live trial, otherwise send them to /onboarding to pick a
  // plan. We reuse the request-scoped supabase client (RLS-scoped to the user)
  // rather than importing server-only helpers, keeping this proxy-safe.
  //
  // RESILIENCE: only Stripe-configured deployments gate. If STRIPE_SECRET_KEY
  // is unset, billing is not live yet, so we let users through to keep /app
  // reachable in dev. (Supabase is already known-configured at this point.)
  const requiresSub = SUBSCRIPTION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (user && requiresSub && process.env.STRIPE_SECRET_KEY) {
    let hasAccess = false;
    try {
      // Find the org(s) this user owns, then their latest subscription row.
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id);
      const orgIds = (orgs ?? []).map((o: { id: string }) => o.id);

      if (orgIds.length > 0) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, trial_end, current_period_end")
          .in("org_id", orgIds)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        hasAccess = subRowGrantsAccess(sub);
      }
    } catch {
      // On any lookup error, fail OPEN (let through) so a transient DB issue
      // does not lock paying users out of the app.
      hasAccess = true;
    }

    if (!hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";

      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
