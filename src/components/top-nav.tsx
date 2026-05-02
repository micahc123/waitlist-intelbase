"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Index", href: "/#about" },
  { name: "Work", href: "/work" },
  { name: "Process", href: "/#services" },
  { name: "Pricing", href: "/#pricing" },
];

const CAL_URL = "https://cal.com/intelbase/discovery-call";

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="6" className="fill-ink" />
      <rect x="6" y="6" width="8" height="8" rx="2" className="fill-paper" />
      <rect x="18" y="6" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.4" />
      <rect x="6" y="18" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.4" />
      <rect x="18" y="18" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.2" />
    </svg>
  );
}

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement strip */}
      <div className="hidden items-center justify-between border-b border-ink/100 bg-ink px-6 py-2 font-mono text-[11px] uppercase tracking-[1px] text-paper sm:flex sm:px-8">
        <span>INTELBASE / NOTICE</span>
        <span className="flex items-center gap-2">
          <span className="text-brand">●</span>
          We take a limited number of clients per month
        </span>
        <span>EST. 2024</span>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between border-b border-ink/100 bg-paper px-5 py-4 sm:px-8">
        <Link
          href="/"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-3"
        >
          <LogoMark />
          <span className="text-[16px] font-bold tracking-[-0.4px]">INTELBASE</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n, i) => (
            <Link
              key={n.name}
              href={n.href}
              className="border border-transparent px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-wider text-ink transition-colors hover:border-ink/15"
            >
              <span className="text-ink/40">0{i + 1}/</span>
              {n.name}
            </Link>
          ))}
        </nav>

        <a
          href={CAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden cursor-pointer bg-ink px-4 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-paper transition-opacity hover:opacity-90 md:inline-block"
        >
          Request quote →
        </a>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-9 w-9 items-center justify-center border border-ink md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-b border-ink/100 bg-paper md:hidden">
          <nav className="flex flex-col">
            {navItems.map((n, i) => (
              <Link
                key={n.name}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 px-5 py-4 font-mono text-[12px] uppercase tracking-wider"
              >
                <span className="text-ink/40">0{i + 1}/</span> {n.name}
              </Link>
            ))}
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="bg-ink px-5 py-4 font-mono text-[12px] uppercase tracking-wider text-paper"
            >
              Request quote →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
