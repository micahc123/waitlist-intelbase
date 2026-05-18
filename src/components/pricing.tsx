"use client";

import { Icon } from "@/components/icons";
import { trackLead, trackContact } from "@/lib/meta-pixel";

const WA_URL =
  "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

const lines = [
  "Full scoping & architecture",
  "Setup, integration, deployment",
  "Built on your stack & accounts",
  "Hand-off + walk-through",
  "Post-launch support window",
];

export function Pricing({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="section" id="pricing">
      <div className="section-head reveal">
        <span className="section-tag">Pricing</span>
        <h2 className="section-title">
          Every business is different.{" "}
          <span className="accent">So is every quote.</span>
        </h2>
        <p className="section-sub">
          No shrink-wrapped packages. We scope to your stack, your team, your
          goals — then send a flat quote before any work starts.
        </p>
      </div>

      <div className="pricing-card reveal">
        <span className="pricing-eyebrow">Flat · pre-quoted · no retainers</span>
        <div className="pricing-title">Custom.</div>
        <div className="pricing-range">
          We quote what you actually need — scoped to your stack, your team,
          and your goals.
        </div>
        <div className="pricing-lines">
          {lines.map((l) => (
            <div className="pricing-line" key={l}>
              <span className="check">
                <Icon name="check" />
              </span>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className="pricing-cta">
          <button
            className="btn btn-primary"
            onClick={() => {
              trackLead();
              onQuote();
            }}
          >
            Get my free quote <span className="arr">→</span>
          </button>
          <a
            className="btn btn-ghost"
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackContact}
          >
            WhatsApp <span className="arr">→</span>
          </a>
        </div>
        <div className="pricing-foot">
          30-minute discovery call · No sales pressure · Quote within 24 hours
        </div>
      </div>
    </section>
  );
}
