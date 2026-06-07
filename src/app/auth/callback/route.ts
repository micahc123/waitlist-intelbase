// OAuth / email-confirmation callback. Standard Next.js App Router route handler
// (named GET taking a Request, returning a redirect Response) -- confirmed
// against the fork's route-handlers doc. Supabase redirects here with a `code`
// query param; we exchange it for a session (which writes the auth cookies via
// the server client) and then send the user on to `next` or /app.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/app";
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Missing authorization code.")}`,
  );
}
