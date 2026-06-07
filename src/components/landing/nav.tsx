"use client";

import { Hexagon, ArrowRight } from "lucide-react";

export function LandingNav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <a href="/" className="lp-brand" aria-label="Intelbase home">
          <span className="lp-brand-mark">
            <Hexagon strokeWidth={2.4} />
          </span>
          Intelbase
        </a>

        <div className="lp-nav-links">
          <a href="#product">Product</a>
          <a href="/pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="lp-nav-cta">
          <a href="/api/demo" className="lp-nav-login">Live demo</a>
          <a href="/login" className="lp-nav-login">Log in</a>
          <a href="/signup" className="lp-btn lp-btn-primary lp-btn-sm">
            Start free trial <ArrowRight />
          </a>
        </div>
      </div>
    </nav>
  );
}
