"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as Lucide from "lucide-react";
import type { GraphNode, Domain } from "@/lib/command/types";
import type { Projected } from "./projection";

export type NodesHandle = {
  apply: (
    proj: Map<string, Projected>,
    ctx: {
      firing: Set<string>;
      selected: string | null;
      hovered: string | null;
      activeDomain: string | null;
    },
  ) => void;
};

function MiniSpark({ series, color }: { series: number[]; color: string }) {
  const w = 56;
  const h = 16;
  if (!series || series.length < 2) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const step = w / (series.length - 1);
  const line = series
    .map((v, i) => {
      const x = i * step;
      const y = h - 2 - ((v - min) / span) * (h - 4);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="cst-node-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

type NodeRefs = {
  wrap: HTMLDivElement;
  tile: HTMLDivElement;
};

export const Nodes = forwardRef<NodesHandle, {
  nodes: GraphNode[];
  domains: Domain[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}>(function Nodes({ nodes, domains, onHover, onSelect }, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refMap = useRef<Map<string, NodeRefs>>(new Map());

  const domainColor = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of domains) m.set(d.id, d.color);
    return m;
  }, [domains]);

  useImperativeHandle(ref, () => ({
    apply(proj, sctx) {
      const map = refMap.current;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const refs = map.get(n.id);
        const p = proj.get(n.id);
        if (!refs || !p) continue;

        // fog factor: 1 near .. 0 far
        const fog = 1 - Math.min(1, Math.max(0, (p.depth + 1.4) / 2.8));

        const isHover = sctx.hovered === n.id;
        const isSel = sctx.selected === n.id;
        const isFiring = sctx.firing.has(n.id);

        let scale = p.scale;
        if (isHover || isSel) scale *= 1.22;

        // base opacity by fog + kind
        let opacity = 0.32 + fog * 0.68;
        if (n.kind === "client") opacity *= 0.92;

        // domain focus
        if (sctx.activeDomain) {
          if (n.domain === sctx.activeDomain || n.id === "core") {
            opacity = Math.min(1, opacity + 0.15);
            scale *= 1.06;
          } else {
            opacity *= 0.18;
          }
        }

        if (isHover || isSel) opacity = 1;

        const zIndex = Math.round((2 - p.depth) * 1000);

        refs.wrap.style.transform = `translate3d(${(p.x).toFixed(1)}px, ${(p.y).toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        refs.wrap.style.opacity = opacity.toFixed(3);
        refs.wrap.style.zIndex = String(zIndex);
        // depth fog: far nodes still desaturated/dimmer; near nodes full saturation with brightness boost
        refs.wrap.style.filter = fog < 0.72
          ? `saturate(${(0.65 + fog * 0.7).toFixed(2)}) brightness(${(0.82 + fog * 0.25).toFixed(2)})`
          : `saturate(1.15) brightness(1.05)`;

        // state classes (toggle only when needed is overkill; className set is cheap)
        const cls = refs.wrap.classList;
        cls.toggle("is-hover", isHover);
        cls.toggle("is-selected", isSel);
        cls.toggle("is-firing", isFiring);
        cls.toggle("is-near", fog > 0.62);
      }
    },
  }), [nodes]);

  // collect refs after mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = new Map<string, NodeRefs>();
    container.querySelectorAll<HTMLDivElement>(".cst-node").forEach((wrap) => {
      const id = wrap.dataset.id!;
      const tile = wrap.querySelector<HTMLDivElement>(".cst-node-tile")!;
      map.set(id, { wrap, tile });
    });
    refMap.current = map;
  }, [nodes]);

  return (
    <div ref={containerRef} className="cst-nodes">
      {nodes.map((n) => {
        const color = domainColor.get(n.domain) ?? "#6ea8ff";
        const Icon = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[n.icon] ?? Lucide.Circle;
        const domLabel = domains.find((d) => d.id === n.domain)?.label ?? n.domain;
        const isCore = n.kind === "core";
        return (
          <div
            key={n.id}
            data-id={n.id}
            className={`cst-node cst-node--${n.kind}`}
            style={{
              ["--nc" as string]: color,
            }}
            onPointerEnter={() => onHover(n.id)}
            onPointerLeave={() => onHover(null)}
            onPointerDown={(e) => {
              // do not start a drag-rotate when pressing a node
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(n.id);
            }}
          >
            {isCore && (
              <>
                <span className="cst-core-ring cst-core-ring--1" />
                <span className="cst-core-ring cst-core-ring--2" />
                <span className="cst-core-ring cst-core-ring--3" />
              </>
            )}
            <span className="cst-fire-ring" />
            <div className="cst-node-tile">
              <span className="cst-hit" aria-hidden="true" />
              <Icon size={isCore ? 28 : n.kind === "agent" ? 19 : 14} strokeWidth={isCore ? 1.7 : 1.9} />
            </div>
            <div className="cst-node-meta">
              <div className="cst-node-label">{n.label}</div>
              <div className="cst-node-detail">
                <span className="cst-node-lvl">LV {n.level}</span>
                <span className="cst-node-metric">{n.metric}</span>
              </div>
              <MiniSpark series={n.series} color={color} />
            </div>
            <div className="cst-tooltip" role="tooltip">
              <div className="cst-tip-label">{n.label}</div>
              <div className="cst-tip-row">
                <span>{domLabel}</span>
                <span className="cst-tip-kind">{n.kind}</span>
              </div>
              <div className="cst-tip-metric">{n.metric}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
