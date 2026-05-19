"use client";

import { trackLead, trackContact } from "@/lib/meta-pixel";

const WA_URL =
  "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

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
          <span className="pulse" /> 6 spots open
        </span>
        <span className="sep" />
        <span>Book now →</span>
      </button>

      <h1 className="hero-title">
        We help companies <span className="accent">scale</span> without hiring more.
      </h1>

      <p className="hero-lede">
        We design and ship <strong>AI automation services</strong> that take the
        repetitive work off your team — lead routing, back-office ops, content,
        and custom agents wired into your stack. Less time spent on busywork,
        more capacity to grow.
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
        <a
          className="btn btn-ghost btn-xl"
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackContact}
        >
          WhatsApp <span className="arr">→</span>
        </a>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="val">
            50<span className="unit">+</span>
          </div>
          <div className="lbl">Businesses automated</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            72<span className="unit">h</span>
          </div>
          <div className="lbl">Avg ship time</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            4.9<span className="unit">/5</span>
          </div>
          <div className="lbl">Client rating</div>
        </div>
        <div className="hero-stat">
          <div className="val">
            24<span className="unit">h</span>
          </div>
          <div className="lbl">Quote turnaround</div>
        </div>
      </div>
    </section>
  );
}
