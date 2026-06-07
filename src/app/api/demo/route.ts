import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Demo pass: one click into the gated product without Supabase/auth. Sets an
// `ib_demo` cookie that the proxy honors (so it also works after Supabase is
// configured later), then drops the visitor into the app. To leave demo mode,
// hit /api/demo?exit=1.
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (url.searchParams.get("exit") === "1") {
    const res = NextResponse.redirect(new URL("/", url.origin));
    res.cookies.set("ib_demo", "", { path: "/", maxAge: 0 });
    return res;
  }

  const to = url.searchParams.get("to") || "/app";
  const res = NextResponse.redirect(new URL(to, url.origin));
  res.cookies.set("ib_demo", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
