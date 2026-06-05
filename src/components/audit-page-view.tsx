"use client";

// GROW-08: client wrapper for the /audit page. Gives the standalone audit a
// minimal header and a back link, runs the shared reveal animation hook, and
// mounts the ReadinessAudit scorecard. Kept separate from page.tsx so the page
// stays a thin server component (and can export metadata).

import Image from "next/image";
import Link from "next/link";
import { ReadinessAudit } from "@/components/readiness-audit";
import { useReveal } from "@/lib/use-reveal";

export function AuditPageView() {
  useReveal();

  return (
    <div className="shell">
      <header className="audit-topbar">
        <Link href="/" className="audit-brand" aria-label="Back to intelbase home">
          <span className="brand-mark" style={{ width: 34, height: 34 }}>
            <Image
              src="/intelbase-logo.png"
              alt=""
              width={68}
              height={68}
              style={{ width: 34, height: 34 }}
            />
          </span>
          <span className="audit-brand-name">Intelbase</span>
        </Link>
        <Link href="/" className="audit-back">
          Back to site <span className="arr">→</span>
        </Link>
      </header>

      <ReadinessAudit />

      <style>{AUDIT_PAGE_CSS}</style>
    </div>
  );
}

const AUDIT_PAGE_CSS = `
.audit-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 1.1rem clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--border);
}
.audit-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--ink);
  font-weight: 800;
  font-size: 1.05rem;
}
.audit-brand-name { color: var(--ink); }
.audit-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: var(--body);
  font-size: 0.92rem;
  font-weight: 600;
}
.audit-back:hover { color: var(--brand); }
.audit-back .arr { transition: transform 200ms ease; display: inline-block; }
.audit-back:hover .arr { transform: translateX(3px); }
`;
