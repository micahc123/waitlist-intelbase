"use client";

import Image from "next/image";
import { trackLead } from "@/lib/meta-pixel";

type NavItem = { label: string; id: string };

const items: NavItem[] = [
  { label: "Services", id: "services" },
  { label: "Process", id: "process" },
  { label: "Results", id: "work" },
  { label: "Pricing", id: "pricing" },
];

export function TopNav({
  onQuote,
  active,
}: {
  onQuote: () => void;
  active: string;
}) {
  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-mark">
            <Image
              src="/intelbase-logo.png"
              alt="Intelbase logo"
              width={128}
              height={128}
              priority
            />
          </span>
          <span className="brand-name">Intelbase</span>
        </a>
        <nav className="nav-links">
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              onClick={(e) => go(e, it.id)}
              className={"nav-link" + (active === it.id ? " active" : "")}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              trackLead();
              onQuote();
            }}
          >
            Get a quote <span className="arr">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
