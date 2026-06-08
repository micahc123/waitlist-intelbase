"use client";

import { useState } from "react";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();

    if (!value) return setError("Please enter your email to join.");
    if (!isValidEmail(value))
      return setError("Hmm, that doesn’t look like a valid email.");

    // TODO: swap this for your real provider (Resend, Mailchimp, an API route…)
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <div className="success-card">
        <div className="check">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>You&apos;re on the list! 🎉</h3>
        <p>
          We&apos;ll email <b>{email}</b> the moment your Intelbase access opens
          up.
        </p>
      </div>
    );
  }

  return (
    <div className="signup">
      <form className="form-row" onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          aria-label="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
        />
        <button className="submit" type="submit">
          Get early access <span className="arrow">→</span>
        </button>
      </form>
      <div className="msg">{error}</div>
      <p className="hint">
        Join <b>2,400+ operators</b> already on the list. No spam — just launch
        news.
      </p>
    </div>
  );
}
