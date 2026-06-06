"use client";

import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { useSim } from "@/lib/command/use-sim";
import type { Domain, GraphNode } from "@/lib/command/types";

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function domainVars(color: string): CSSProperties {
  return {
    ["--dc" as string]: color,
    ["--dc-fill" as string]: color,
    ["--dc-soft" as string]: hexToRgba(color, 0.1),
    ["--dc-border" as string]: hexToRgba(color, 0.4),
    ["--dc-glow" as string]: hexToRgba(color, 0.5),
  };
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const w = 300;
  const h = 44;
  if (!series || series.length < 2) return <svg className="cmd-spark" viewBox={`0 0 ${w} ${h}`} />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => {
    const x = i * step;
    const y = h - 4 - ((v - min) / span) * (h - 8);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const gid = `cmd-spark-grad-${color.replace("#", "")}`;
  return (
    <svg className="cmd-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

function Content({ node, domain }: { node: GraphNode; domain: Domain }) {
  const { links, setSelected } = useSim();
  const Icon = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[node.icon] ?? Lucide.Circle;
  const connections = links.filter((l) => l.from === node.id || l.to === node.id).length;
  const color = domain.color;

  return (
    <div className="cmd-detail" style={domainVars(color)}>
      <header className="cmd-detail-head">
        <span className="cmd-detail-tile">
          <Icon size={22} strokeWidth={1.9} />
        </span>
        <div className="cmd-detail-id">
          <div className="cmd-detail-label">{node.label}</div>
          <div className="cmd-detail-sub">
            {node.kind} / {domain.label}
          </div>
        </div>
        <button
          type="button"
          className="cmd-detail-close"
          aria-label="Close (Esc)"
          onClick={() => setSelected(null)}
        >
          ESC
        </button>
      </header>

      <div className="cmd-detail-body">
        <div className="cmd-level">
          <div className="cmd-level-top">
            <span className="cmd-mini-label">Level</span>
            <span className="cmd-level-num">LV {node.level}</span>
          </div>
          <div className="cmd-xp-track">
            <div className="cmd-xp-fill" style={{ width: `${Math.max(0, Math.min(100, node.xp))}%` }} />
          </div>
        </div>

        <div className="cmd-row-between">
          <span className="cmd-mini-label">Status</span>
          <span className={`cmd-status-chip cmd-status--${node.status}`}>
            <span className="cmd-feed-dot" />
            {node.status}
          </span>
        </div>

        <div className="cmd-metric">
          <div className="cmd-row-between">
            <span className="cmd-mini-label">Throughput</span>
            <span className="cmd-metric-val">{node.metric}</span>
          </div>
          <Sparkline series={node.series} color={color} />
        </div>

        {node.queue.length > 0 && (
          <div className="cmd-queue">
            <span className="cmd-mini-label">Queue</span>
            {node.queue.map((q, i) => (
              <div key={i} className="cmd-queue-item">
                <span className="cmd-queue-idx">{String(i + 1).padStart(2, "0")}</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        )}

        <div className="cmd-conn">
          <span className="cmd-mini-label">Connections</span>
          <span className="cmd-conn-num">{connections}</span>
        </div>
      </div>

      <div className="cmd-actions">
        <button type="button" className="cmd-action cmd-action--primary">
          <Lucide.Crosshair size={13} strokeWidth={2} />
          Focus
        </button>
        <button type="button" className="cmd-action">
          <Lucide.Pause size={13} strokeWidth={2} />
          Pause
        </button>
        <button type="button" className="cmd-action">
          <Lucide.Search size={13} strokeWidth={2} />
          Inspect
        </button>
      </div>
    </div>
  );
}

export function DetailPanel() {
  const { selected, nodes, domains } = useSim();
  const node = selected ? nodes.find((n) => n.id === selected) ?? null : null;
  const domain = node ? domains.find((d) => d.id === node.domain) ?? null : null;

  return (
    <AnimatePresence>
      {node && domain && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 6 }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <Content node={node} domain={domain} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
