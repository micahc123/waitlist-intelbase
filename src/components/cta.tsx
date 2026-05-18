"use client";

import { trackLead, trackContact } from "@/lib/meta-pixel";

const WA_URL =
  "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

export function CTA({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="final-cta">
      <div className="final-cta-card">
        <span className="final-cta-eyebrow">
          <span className="dot" /> Limited clients per month
        </span>
        <h2 className="final-cta-title">
          Automate. Ship. <span className="accent">Repeat.</span>
        </h2>
        <p className="final-cta-sub">
          Book a free 30-min call. We scope the build, send a flat quote within
          24 hours, and ship it.
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
          No pressure · Quote in 24 hrs · You own everything
        </div>
      </div>
    </section>
  );
}
