"use client";

import { useEffect, useState } from "react";
import { trackLead } from "@/lib/meta-pixel";

export function StickyCta({ onQuote }: { onQuote: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="mobile-cta" aria-hidden={!visible}>
      <a
        href="#pricing"
        onClick={(e) => {
          e.preventDefault();
          trackLead();
          onQuote();
        }}
      >
        Get my free quote <span className="arr">→</span>
      </a>
    </div>
  );
}
