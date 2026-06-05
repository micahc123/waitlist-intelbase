"use client";

// GROW-06: "Try it on your site" demo lead magnet. A prospect enters their
// website URL + email; we POST to /api/try-it, which reads their site text and
// generates a short sample of how the intelbase OS concierge would greet and
// qualify their visitors. The email is captured as a lead (source = "try-it").
//
// Matches the site design system: reuses .section / .section-head / .section-tag
// / .section-title / .section-sub / .btn classes, the CSS tokens, and carries a
// scoped <style> block prefixed `ib-try-` for the form-specific bits (same pattern
// as chat-widget.tsx). No em dashes in copy (house style).

import { useState } from "react";
import { trackEvent } from "@/lib/meta-pixel";

type TryItResponse = {
  sample?: string;
  degraded?: boolean;
  error?: string;
};

export function TryIt() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sample, setSample] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSample(null);

    const cleanUrl = url.trim();
    const cleanEmail = email.trim();
    if (!cleanUrl || !cleanEmail) {
      setError("Add your website and your email to see the demo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/try-it", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: cleanUrl, email: cleanEmail }),
      });
      const data = (await res.json()) as TryItResponse;

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Try again in a moment.");
        return;
      }

      setSample(data.sample ?? "");
      // Lead-magnet engagement signal for the Ad Engine, separate from booked calls.
      trackEvent("Lead", { content_name: "try_it_demo" });
    } catch {
      setError("Could not reach the demo just now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSample(null);
    setError(null);
  }

  return (
    <section className="section alt" id="try-it">
      <style>{TRY_IT_CSS}</style>
      <div className="section-head reveal">
        <span className="section-tag">See it on your own site</span>
        <h2 className="section-title">
          Watch the OS <span className="accent">greet your visitors.</span>
        </h2>
        <p className="section-sub">
          Drop in your website and we will show you a live sample of how the
          intelbase OS concierge would welcome and qualify the people landing on
          your site. No setup, no call required.
        </p>
      </div>

      <div className="ib-try-wrap reveal">
        {!sample ? (
          <form className="ib-try-form" onSubmit={onSubmit}>
            <div className="ib-try-fields">
              <label className="ib-try-field">
                <span className="ib-try-label">Your website</span>
                <input
                  className="ib-try-input"
                  type="text"
                  inputMode="url"
                  placeholder="yourcompany.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="url"
                  aria-label="Your website URL"
                />
              </label>
              <label className="ib-try-field">
                <span className="ib-try-label">Your email</span>
                <input
                  className="ib-try-input"
                  type="email"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-label="Your email"
                />
              </label>
            </div>

            {error && <p className="ib-try-error">{error}</p>}

            <button
              className="btn btn-primary ib-try-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Reading your site..." : "Show me the demo"}
              <span className="arr">→</span>
            </button>
            <p className="ib-try-fine">
              We send the full walkthrough to your email. Autonomous, with
              guardrails. It will never invent a price.
            </p>
          </form>
        ) : (
          <div className="ib-try-result">
            <div className="ib-try-result-head">
              <span className="ib-try-avatar">io</span>
              <div>
                <div className="ib-try-result-title">
                  intelbase OS concierge
                </div>
                <div className="ib-try-result-sub">
                  Sample greeting for {stripScheme(url)}
                </div>
              </div>
            </div>
            <div className="ib-try-bubble">{sample}</div>
            <p className="ib-try-fine">
              This is a quick preview. We just emailed you the full walkthrough,
              tuned to your business and your rules.
            </p>
            <button
              className="btn btn-ghost ib-try-again"
              type="button"
              onClick={reset}
            >
              Try another site
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function stripScheme(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

const TRY_IT_CSS = `
.ib-try-wrap {
  max-width: 640px;
  margin: clamp(1.5rem, 4vw, 2.5rem) auto 0;
}
.ib-try-form, .ib-try-result {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: clamp(1.25rem, 4vw, 2rem);
}
.ib-try-fields {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.ib-try-field {
  flex: 1 1 240px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.ib-try-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--body);
}
.ib-try-input {
  width: 100%;
  padding: 0.8rem 0.95rem;
  font-size: 0.98rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-soft);
  color: var(--ink);
  font-family: inherit;
  outline: none;
  transition: border-color .15s ease, background .15s ease;
}
.ib-try-input:focus {
  border-color: var(--brand);
  background: var(--bg);
}
.ib-try-submit {
  margin-top: 1.1rem;
  width: 100%;
  justify-content: center;
}
.ib-try-error {
  margin: 0.9rem 0 0;
  color: #B42318;
  font-size: 0.9rem;
}
.ib-try-fine {
  margin: 0.9rem 0 0;
  font-size: 0.82rem;
  color: var(--body-2);
  text-align: center;
}
.ib-try-result-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.ib-try-avatar {
  width: 38px; height: 38px; border-radius: 11px;
  display: grid; place-items: center;
  background: var(--brand); color: #fff;
  font-weight: 800; font-size: 13px; letter-spacing: .5px;
  flex: 0 0 auto;
}
.ib-try-result-title { font-weight: 700; font-size: 1rem; color: var(--ink); }
.ib-try-result-sub { font-size: 0.82rem; color: var(--body); }
.ib-try-bubble {
  background: var(--bg-mute);
  color: var(--ink);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  padding: 1rem 1.1rem;
  font-size: 0.98rem;
  line-height: 1.55;
  white-space: pre-wrap;
}
.ib-try-again { margin-top: 1.1rem; }
`;
