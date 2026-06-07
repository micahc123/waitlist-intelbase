"use client";

import { Hexagon, ArrowRight } from "lucide-react";

export function LandingFooter() {
  return (
    <>
      <section className="lp-final">
        <div className="lp-wrap">
          <div className="lp-final-card">
            <h2>Let Intelbase run your business.</h2>
            <p>
              Connect your tools once and watch the front office run itself. Start your 14-day free
              trial today.
            </p>
            <div className="lp-hero-cta">
              <a href="/signup" className="lp-btn lp-btn-primary">Start free trial <ArrowRight /></a>
              <a href="/pricing" className="lp-btn lp-btn-ghost">View pricing</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-inner">
            <a href="/" className="lp-brand" aria-label="Intelbase home">
              <span className="lp-brand-mark"><Hexagon strokeWidth={2.4} /></span>
              Intelbase
            </a>
            <nav className="lp-footer-nav">
              <a href="#product">Product</a>
              <a href="/pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <a href="/login">Log in</a>
              <a href="/signup">Start free trial</a>
            </nav>
          </div>
          <div className="lp-footer-copy">
            &copy; {new Date().getFullYear()} Intelbase. The AI operating system that runs your business.
          </div>
        </div>
      </footer>
    </>
  );
}
