"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, forwardRef } from "react";
import type { Link, GraphNode, Domain } from "@/lib/command/types";
import type { Projected } from "./projection";

export type StrandsHandle = {
  apply: (
    proj: Map<string, Projected>,
    ctx: {
      firing: Set<string>;
      selected: string | null;
      hovered: string | null;
      activeDomain: string | null;
      t: number;
    },
  ) => void;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// Blend a domain color toward a cool base so strands read as energy lines.
function blendToward(rgb: [number, number, number], to: [number, number, number], k: number): string {
  const r = Math.round(rgb[0] * (1 - k) + to[0] * k);
  const g = Math.round(rgb[1] * (1 - k) + to[1] * k);
  const b = Math.round(rgb[2] * (1 - k) + to[2] * k);
  return `rgb(${r}, ${g}, ${b})`;
}

type StrandEl = {
  from: string;
  to: string;
  path: SVGPathElement;
  glow: SVGPathElement;
  pulse: SVGCircleElement;
  color: string;
  domain: string;
};

export const Strands = forwardRef<StrandsHandle, {
  links: Link[];
  nodes: GraphNode[];
  domains: Domain[];
}>(function Strands({ links, nodes, domains }, ref) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const elsRef = useRef<StrandEl[]>([]);

  const { nodeMap, domainColor } = useMemo(() => {
    const nm = new Map<string, GraphNode>();
    for (const n of nodes) nm.set(n.id, n);
    const dc = new Map<string, string>();
    for (const d of domains) dc.set(d.id, d.color);
    return { nodeMap: nm, domainColor: dc };
  }, [nodes, domains]);

  // Build static link element list once.
  const linkData = useMemo(() => {
    return links.map((l) => {
      const child = nodeMap.get(l.from);
      const color = child ? domainColor.get(child.domain) ?? "#6ea8ff" : "#6ea8ff";
      return { from: l.from, to: l.to, color, domain: child?.domain ?? "" };
    });
  }, [links, nodeMap, domainColor]);

  useImperativeHandle(ref, () => ({
    apply(proj, sctx) {
      const els = elsRef.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const a = proj.get(el.from);
        const b = proj.get(el.to);
        if (!a || !b) {
          el.path.style.opacity = "0";
          el.glow.style.opacity = "0";
          el.pulse.style.opacity = "0";
          continue;
        }

        // curved bezier with a perpendicular bow
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const bow = Math.min(60, len * 0.18);
        const cx = mx + (-dy / len) * bow;
        const cy = my + (dx / len) * bow;
        const d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
        el.path.setAttribute("d", d);
        el.glow.setAttribute("d", d);

        // fog by average depth (depth: -1.4 near .. 1.4 far)
        const avgDepth = (a.depth + b.depth) / 2;
        const fog = 1 - Math.min(1, Math.max(0, (avgDepth + 1.4) / 2.8)); // 1 near .. 0 far

        const isActive =
          sctx.firing.has(el.from) ||
          sctx.firing.has(el.to) ||
          sctx.selected === el.from ||
          sctx.selected === el.to ||
          sctx.hovered === el.from ||
          sctx.hovered === el.to;

        // domain dim
        let domainK = 1;
        if (sctx.activeDomain && el.domain !== sctx.activeDomain) domainK = 0.16;

        const baseOpacity = (0.1 + fog * 0.22) * domainK;
        const activeOpacity = (0.45 + fog * 0.45) * Math.max(domainK, 0.5);

        el.path.style.opacity = String(isActive ? activeOpacity : baseOpacity);
        el.path.style.strokeWidth = isActive ? "1.7" : "1.0";
        el.glow.style.opacity = isActive ? String(0.5 * Math.max(domainK, 0.5)) : "0";
        el.glow.style.strokeWidth = "3.2";

        // traveling pulse on active strands
        if (isActive) {
          // position along quadratic bezier by parameter p
          const p = (sctx.t * 0.6 + i * 0.13) % 1;
          const inv = 1 - p;
          const qx = inv * inv * a.x + 2 * inv * p * cx + p * p * b.x;
          const qy = inv * inv * a.y + 2 * inv * p * cy + p * p * b.y;
          el.pulse.setAttribute("cx", qx.toFixed(1));
          el.pulse.setAttribute("cy", qy.toFixed(1));
          el.pulse.style.opacity = String(0.9 * Math.max(domainK, 0.5));
        } else {
          el.pulse.style.opacity = "0";
        }
      }
    },
  }), []);

  // attach element refs after mount
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const groups = svg.querySelectorAll<SVGGElement>("g[data-strand]");
    const els: StrandEl[] = [];
    groups.forEach((g) => {
      els.push({
        from: g.dataset.from!,
        to: g.dataset.to!,
        glow: g.querySelector<SVGPathElement>(".cst-strand-glow")!,
        path: g.querySelector<SVGPathElement>(".cst-strand-line")!,
        pulse: g.querySelector<SVGCircleElement>(".cst-strand-pulse")!,
        color: g.dataset.color!,
        domain: g.dataset.domain!,
      });
    });
    elsRef.current = els;
  }, [linkData]);

  return (
    <svg ref={svgRef} className="cst-strands" aria-hidden="true">
      {linkData.map((l, i) => {
        const blended = blendToward(hexToRgb(l.color), [120, 180, 255], 0.25);
        return (
          <g
            key={`${l.from}-${l.to}-${i}`}
            data-strand=""
            data-from={l.from}
            data-to={l.to}
            data-color={l.color}
            data-domain={l.domain}
          >
            <path className="cst-strand-glow" fill="none" stroke={l.color} style={{ opacity: 0 }} />
            <path className="cst-strand-line" fill="none" stroke={blended} style={{ opacity: 0 }} />
            <circle className="cst-strand-pulse" r="2.4" fill={l.color} style={{ opacity: 0 }} />
          </g>
        );
      })}
    </svg>
  );
});
