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
        className="hero-eyebrow reveal"
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

      <h1 className="hero-title reveal">
        <span className="accent">Automate</span> your entire business.
      </h1>

      <p className="hero-lede reveal">
        Production-grade AI that actually runs your business.{" "}
        <strong>n8n workflows, custom agents, RAG over your data</strong> — built
        and shipped end-to-end. Not chatbots. Not demos.
      </p>

      <div className="hero-cta-row reveal">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            trackLead();
            onQuote();
          }}
        >
          Book a free call <span className="arr">→</span>
        </button>
        <a
          className="btn btn-ghost btn-lg"
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackContact}
        >
          WhatsApp <span className="arr">→</span>
        </a>
      </div>

      <div className="hero-stats reveal">
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
