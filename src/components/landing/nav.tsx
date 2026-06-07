"use client";

import { useEffect, useState } from "react";
import { Hexagon, ArrowRight } from "lucide-react";

const SECTIONS = ["product", "pricing", "faq"] as const;

export function LandingNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

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
          <a href="#product" className={active === "product" ? "active" : undefined} aria-current={active === "product" ? "true" : undefined}>Product</a>
          <a href="#pricing" className={active === "pricing" ? "active" : undefined} aria-current={active === "pricing" ? "true" : undefined}>Pricing</a>
          <a href="#faq" className={active === "faq" ? "active" : undefined} aria-current={active === "faq" ? "true" : undefined}>FAQ</a>
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
