"use server";

// Auth Server Functions (Server Actions). Per the fork's mutating-data doc, a
// "use server" file marks all exports as Server Functions, invoked as POST. Each
// action returns a serializable { error } shape that the client form renders;
// on success it redirect()s (which throws a framework control-flow exception, so
// nothing after it runs).
//
// The DB trigger handle_new_user() (see supabase/schema.sql) creates the
// profile + default organization on auth.users insert, so sign-up does not need
// to write those rows here.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string } | null;

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Only allow same-origin relative paths to avoid open-redirects.
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "";
}

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next || "/app");
}

export async function signUpWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and a password to create an account." };
  }
  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, there is no active session yet.
  if (!data.session) {
    return {
      error:
        "Check your inbox to confirm your email, then sign in to finish setup.",
    };
  }

  // New users go to onboarding; the next param is honored if it was set.
  redirect(next || "/onboarding");
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const callback = new URL(`${origin}/auth/callback`);
  if (next) {
    callback.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  });

  if (error) {
    // Surface OAuth setup errors on the login page rather than a blank screen.
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=Could%20not%20start%20Google%20sign-in.");
}
