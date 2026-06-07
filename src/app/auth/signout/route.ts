// Sign-out route handler. Using a POST route handler (rather than a GET link)
// so sign-out cannot be triggered by a stray prefetch or image request. The
// server client clears the auth cookies; then we redirect home.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 303,
  });
}
