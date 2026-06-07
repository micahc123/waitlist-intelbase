"use client";

// Shared premium dark auth form for /login and /signup. Self-contained styling
// (the marketing site runs a light theme; the product surfaces are dark), so the
// auth pages feel part of the Intelbase OS regardless of global tokens.
//
// Email + password sign in/up via Server Actions (useActionState gives us the
// pending state and the { error } returned by the action). Google OAuth is a
// separate form posting to the signInWithGoogle action. Errors from the action
// and from the ?error= query param (OAuth redirects) are both shown. No em
// dashes in any on-screen copy.

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import "./auth.css";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
  type AuthActionState,
} from "@/app/(auth)/actions";

type Mode = "login" | "signup";

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to your Intelbase OS.",
    submit: "Sign in",
    pending: "Signing in...",
    altPrompt: "New to Intelbase?",
    altHref: "/signup",
    altLabel: "Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start running your front office on autopilot.",
    submit: "Create account",
    pending: "Creating account...",
    altPrompt: "Already have an account?",
    altHref: "/login",
    altLabel: "Sign in",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const action = mode === "login" ? signInWithPassword : signUpWithPassword;
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action,
    null,
  );

  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const queryError = searchParams.get("error");
  const errorMessage = state?.error ?? queryError ?? null;

  return (
    <div className="ib-auth">
      <div className="ib-auth-card">
        <Link href="/" className="ib-auth-brand">
          intelbase
        </Link>

        <h1 className="ib-auth-title">{copy.title}</h1>
        <p className="ib-auth-subtitle">{copy.subtitle}</p>

        {errorMessage ? (
          <div className="ib-auth-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <form action={signInWithGoogle} className="ib-auth-oauth">
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="ib-auth-google" disabled={pending}>
            <GoogleGlyph />
            Continue with Google
          </button>
        </form>

        <div className="ib-auth-divider">
          <span>or</span>
        </div>

        <form action={formAction} className="ib-auth-fields">
          <input type="hidden" name="next" value={next} />

          {mode === "signup" ? (
            <label className="ib-auth-label">
              Full name
              <input
                className="ib-auth-input"
                type="text"
                name="full_name"
                autoComplete="name"
                placeholder="Your name"
              />
            </label>
          ) : null}

          <label className="ib-auth-label">
            Email
            <input
              className="ib-auth-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </label>

          <label className="ib-auth-label">
            Password
            <input
              className="ib-auth-input"
              type="password"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            />
          </label>

          <button type="submit" className="ib-auth-submit" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </button>
        </form>

        <p className="ib-auth-alt">
          {copy.altPrompt}{" "}
          <Link href={copy.altHref} className="ib-auth-link">
            {copy.altLabel}
          </Link>
        </p>

        <p className="ib-auth-home">
          <Link href="/" className="ib-auth-link-muted">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
