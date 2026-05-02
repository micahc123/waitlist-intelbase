"use client";

import Link from "next/link";

const cols = [
  { t: "Intelbase", l: [
    { label: "Manifesto", href: "/#about" },
    { label: "Use cases", href: "/work" },
    { label: "Process", href: "/#services" },
  ]},
  { t: "Build", l: [
    { label: "Agents", href: "/#services" },
    { label: "RAG", href: "/#services" },
    { label: "Workflows", href: "/#services" },
    { label: "Outbound", href: "/#services" },
  ]},
  { t: "Talk", l: [
    { label: "Email", href: "mailto:hello@intelbase.co" },
    { label: "WhatsApp", href: "https://wa.me/85290123551" },
    { label: "Calendly", href: "https://cal.com/intelbase/discovery-call" },
  ]},
];

export function Footer() {
  return (
    <footer className="grid grid-cols-12 gap-6 bg-paper px-6 pb-8 pt-12 sm:px-12">
      <div className="col-span-12 md:col-span-4">
        <div className="mb-3 flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="6" className="fill-ink" />
            <rect x="6" y="6" width="8" height="8" rx="2" className="fill-paper" />
            <rect x="18" y="6" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.4" />
            <rect x="6" y="18" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.4" />
            <rect x="18" y="18" width="8" height="8" rx="2" className="fill-paper" fillOpacity="0.2" />
          </svg>
          <span className="text-[16px] font-bold tracking-[-0.3px]">INTELBASE STUDIO</span>
        </div>
        <div className="font-mono text-[12.5px] leading-[1.6] text-ink/60">
          AI · OPS · INFRASTRUCTURE
          <br />
          For operators who ship.
        </div>
      </div>

      {cols.map((c, i) => (
        <div key={c.t} className={`col-span-6 md:col-span-2 ${i === 0 ? "md:col-start-5" : ""}`}>
          <div className="mb-3.5 border-b border-ink pb-2.5 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60">
            {c.t}
          </div>
          <ul className="grid gap-2.5">
            {c.l.map((x) => {
              const external = x.href.startsWith("http") || x.href.startsWith("mailto:");
              return (
                <li key={x.label}>
                  {external ? (
                    <a
                      href={x.href}
                      target={x.href.startsWith("http") ? "_blank" : undefined}
                      rel={x.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-mono text-[13px] text-ink hover:text-brand"
                    >
                      → {x.label}
                    </a>
                  ) : (
                    <Link href={x.href} className="font-mono text-[13px] text-ink hover:text-brand">
                      → {x.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="col-span-12 md:col-span-2">
        <div className="font-mono text-[11px] uppercase tracking-[1px] text-ink/60">
          © {new Date().getFullYear()} INTELBASE
          <br />
          ALL RIGHTS RESERVED
          <br />
          <span className="text-brand">● ONLINE</span>
        </div>
      </div>
    </footer>
  );
}
