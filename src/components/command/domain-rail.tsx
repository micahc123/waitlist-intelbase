"use client";

import type { CSSProperties } from "react";
import * as Lucide from "lucide-react";
import { useSim } from "@/lib/command/use-sim";
import type { Domain } from "@/lib/command/types";

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function domainVars(d: Domain): CSSProperties {
  return {
    ["--dc" as string]: d.color,
    ["--dc-fill" as string]: d.color,
    ["--dc-soft" as string]: hexToRgba(d.color, 0.1),
    ["--dc-border" as string]: hexToRgba(d.color, 0.4),
    ["--dc-glow" as string]: hexToRgba(d.color, 0.55),
  };
}

export function DomainRail() {
  const { domains, activeDomain, setActiveDomain } = useSim();

  return (
    <aside className="cmd-rail" aria-label="Domains">
      <div className="cmd-rail-head">Domains</div>
      {domains.map((d) => {
        const Icon = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[d.icon] ?? Lucide.Circle;
        const active = activeDomain === d.id;
        return (
          <button
            key={d.id}
            type="button"
            className={`cmd-rail-btn${active ? " is-active" : ""}`}
            style={domainVars(d)}
            aria-pressed={active}
            title={d.label}
            onClick={() => setActiveDomain(active ? null : d.id)}
          >
            <span className="cmd-rail-tile">
              <Icon size={17} strokeWidth={1.9} />
            </span>
            <span className="cmd-rail-label">{d.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
