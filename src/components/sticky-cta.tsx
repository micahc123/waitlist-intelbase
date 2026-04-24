"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

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
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 md:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <a
        href="https://cal.com/intelbase/discovery-call"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between gap-2 rounded-xl border border-white/[0.1] bg-white px-4 py-3 text-[14px] font-semibold text-black shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)]"
      >
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          Book Free Discovery Call
        </span>
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
