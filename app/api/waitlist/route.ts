import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function POST(request: Request) {
  const { url, key } = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!url || !key) {
    return NextResponse.json(
      { error: "Waitlist is not configured yet." },
      { status: 500 }
    );
  }

  let email = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // 23505 = unique_violation → they're already signed up, treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    console.error("waitlist insert failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
