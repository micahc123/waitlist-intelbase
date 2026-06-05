"use client";

import { trackLead } from "@/lib/meta-pixel";

export function Hero({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <div className="rings" />
        <div className="glow" />
        <div className="dots" />
      </div>

      <button
        className="hero-eyebrow"
        onClick={() => {
          trackLead();
          onQuote();
        }}
        type="button"
      >
        <span className="badge">
          <span className="pulse" /> Autonomous, with guardrails
        </span>
        <span className="sep" />
        <span>6 spots open</span>
      </button>

      <h1 className="hero-title">
        An AI operating system that runs your front office,{" "}
        <span className="accent">autonomously.</span>
      </h1>

      <p className="hero-lede">
        intelbase OS answers every visitor, qualifies every lead, books your
        calls, and runs your ads, on its own. You watch the whole thing work on
        one dashboard.
      </p>

      <div className="hero-cta-row">
        <button
          className="btn btn-primary btn-xl"
          onClick={() => {
            trackLead();
            onQuote();
          }}
        >
          Book a free call <span className="arr">→</span>
        </button>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="val">
            24<span className="unit">/7</span>
          </div>
          <div className="lbl">Every visitor answered in seconds</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            5<span className="unit"> in 1</span>
          </div>
          <div className="lbl">Concierge, lead gen, nurture, ads, dashboard</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            4.9<span className="unit">/5</span>
          </div>
          <div className="lbl">Client rating</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            0<span className="unit"> hires</span>
          </div>
          <div className="lbl">Front office that runs itself</div>
        </div>
      </div>
    </section>
  );
}
