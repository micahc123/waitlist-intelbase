"use client";

import { useState } from "react";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();

    if (!value) return setError("Please enter your email to join.");
    if (!isValidEmail(value))
      return setError("Hmm, that doesn’t look like a valid email.");

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
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
        <button className="submit" type="submit" disabled={loading}>
          {loading ? "Joining…" : "Get early access"}{" "}
          <span className="arrow">→</span>
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
