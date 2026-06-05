"use client";

import { trackLead, trackContact } from "@/lib/meta-pixel";

const WA_URL =
  "https://wa.me/85290123551?text=Hi%2C%20I%20want%20intelbase%20OS%20to%20run%20my%20front%20office%20autonomously.";

export function CTA({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="final-cta">
      <div className="final-cta-card">
        <span className="final-cta-eyebrow">
          <span className="dot" /> Limited clients per month
        </span>
        <h2 className="final-cta-title">
          Switch on the OS. <span className="accent">Let it run.</span>
        </h2>
        <p className="final-cta-sub">
          Book a free 30-minute call. We map your business, scope the OS, and get
          it live, answering visitors and booking calls on its own.
        </p>
        <div className="final-cta-actions">
          <button
            className="btn btn-on-dark"
            onClick={() => {
              trackLead();
              onQuote();
            }}
          >
            Get my free quote <span className="arr">→</span>
          </button>
          <a
            className="btn btn-ghost-dark"
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackContact}
          >
            WhatsApp <span className="arr">→</span>
          </a>
        </div>
        <div className="final-cta-foot">
          No pressure · Autonomous, with guardrails · You keep your accounts
        </div>
      </div>
    </section>
  );
}
