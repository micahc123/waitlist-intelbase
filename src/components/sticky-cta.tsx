"use client";

import { useEffect, useState } from "react";

const CAL_URL = "https://cal.com/intelbase/discovery-call";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <a
        href={CAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between gap-3 bg-ink px-5 py-4 font-mono text-[12.5px] uppercase tracking-[1.2px] text-paper shadow-[0_8px_24px_rgba(10,10,10,0.18)]"
      >
        <span className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 bg-brand" />
          Book free discovery call
        </span>
        <span>→</span>
      </a>
    </div>
  );
}
