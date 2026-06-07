// FORK NOTE -- this file is what stock Next.js calls `middleware.ts`.
// This Next.js fork (16.2.2) DEPRECATED and RENAMED the `middleware` file
// convention to `proxy` (see node_modules/next/dist/docs/01-app/.../proxy.md:
// "the middleware file convention is deprecated and has been renamed to proxy",
// v16.0.0). The exported function must be named `proxy` (or be a default
// export), and the matcher config is unchanged. A `src/middleware.ts` would be
// ignored by this fork, so the task's requested filename is implemented HERE as
// src/proxy.ts to match the runtime convention. Behavior is identical.
//
// We refresh the Supabase session on every matched request and auth-gate
// /app and /onboarding (redirect to /login?next=... when unauthenticated).
// Public routes (/, /pricing, /login, /signup, /auth/*) pass straight through.

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes have their own auth checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - common static asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
