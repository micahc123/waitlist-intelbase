"use client";

import * as Lucide from "lucide-react";
import { motion } from "motion/react";
import { useSim } from "@/lib/command/use-sim";
import type { DomainId, GraphNode } from "@/lib/command/types";
import "./deck.css";

const ICONS = Lucide as unknown as Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number }>
>;
function Icon({ name, size = 20, strokeWidth = 1.6 }: { name: string; size?: number; strokeWidth?: number }) {
  const C = ICONS[name] ?? Lucide.Circle;
  return <C size={size} strokeWidth={strokeWidth} />;
}

const ABILITIES: Record<DomainId, string[]> = {
  leadgen: ["Source", "Score", "Enrich"],
  outreach: ["Sequence", "Personalize", "A/B test"],
  pipeline: ["Stage routing", "Forecast", "Deal hygiene"],
  engagement: ["Triage", "Auto-reply", "Sentiment"],
  followups: ["Re-engage", "Cadence", "Reminders"],
  content: ["Draft", "Schedule", "Approve"],
  systems: ["Health checks", "Provision", "Configure"],
  finance: ["Invoice", "Reconcile", "Report"],
  ops: ["Route calls", "Book", "Transcribe"],
  recovery: ["Win-back", "Reactivate", "Recover"],
  data: ["Sync", "Dedupe", "Segment"],
  automation: ["Trigger", "Retry", "Batch"],
};

function Spark({ series, color }: { series: number[]; color: string }) {
  const w = 78;
  const h = 26;
  if (!series.length) return null;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return [x, y] as const;
  });
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const id = `dk-g-${color.replace(/[^a-z0-9]/gi, "")}`;
  const last = pts[pts.length - 1];
  return (
    <svg className="dk-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} />
    </svg>
  );
}

function DeckCard({ node, color, label, idx }: { node: GraphNode; color: string; label: string; idx: number }) {
  const { setSelected, setView } = useSim();
  const abilities = ABILITIES[node.domain] ?? [];
  return (
    <motion.button
      type="button"
      className="dk-card"
      style={{ ["--dc" as string]: color }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={() => {
        setSelected(node.id);
        setView("agents");
      }}
    >
      <div className="dk-card-top">
        <span className="dk-tile">
          <Icon name={node.icon} size={22} />
        </span>
        <div className="dk-card-id">
          <div className="dk-name">{node.label}</div>
          <span className="dk-domain">
            <span className="dk-domain-dot" />
            {label}
          </span>
        </div>
        <span className="dk-chip" data-s={node.status}>
          <span className="dk-chip-dot" />
          {node.status}
        </span>
      </div>

      <div className="dk-level">
        <span className="dk-lv-badge">
          LVL <b>{node.level}</b>
        </span>
        <span className="dk-xp">
          <span className="dk-xp-fill" style={{ width: `${node.xp}%` }} />
        </span>
        <span className="dk-xp-pct">{node.xp}%</span>
      </div>

      <div className="dk-abilities">
        {abilities.map((a) => (
          <span className="dk-ability" key={a}>
            {a}
          </span>
        ))}
      </div>

      <div className="dk-metric-row">
        <div>
          <div className="dk-metric-k">Lifetime</div>
          <div className="dk-metric-v">{node.metric}</div>
        </div>
        <Spark series={node.series} color={color} />
      </div>

      <span className="dk-cta">
        Open in graph <Lucide.ArrowUpRight size={12} strokeWidth={2} />
      </span>
    </motion.button>
  );
}

export function Deck() {
  const { nodes, domains } = useSim();
  const agents = nodes.filter((n) => n.kind === "agent");
  const domMap = Object.fromEntries(domains.map((d) => [d.id, d]));

  const active = agents.filter((a) => a.status !== "idle").length;
  const avgLevel = Math.round(agents.reduce((s, a) => s + a.level, 0) / agents.length);
  const queued = agents.reduce((s, a) => s + a.queue.length, 0);

  return (
    <div className="dk-root">
      <div className="dk-head">
        <div className="dk-head-l">
          <span className="dk-head-mark">
            <Lucide.LayoutGrid size={22} strokeWidth={1.6} />
          </span>
          <div>
            <div className="dk-title">Agent Deck</div>
            <div className="dk-sub">{agents.length} agents deployed</div>
          </div>
        </div>
        <div className="dk-head-stats">
          <div>
            <div className="dk-stat-k">Online</div>
            <div className="dk-stat-v">
              {active}
              <small>/ {agents.length}</small>
            </div>
          </div>
          <div>
            <div className="dk-stat-k">Avg level</div>
            <div className="dk-stat-v">{avgLevel}</div>
          </div>
          <div>
            <div className="dk-stat-k">In queue</div>
            <div className="dk-stat-v">{queued}</div>
          </div>
        </div>
      </div>

      <div className="dk-grid">
        {agents.map((node, i) => {
          const dom = domMap[node.domain];
          return (
            <DeckCard
              key={node.id}
              node={node}
              idx={i}
              color={dom?.color ?? "#6ea8ff"}
              label={dom?.label ?? node.domain}
            />
          );
        })}
      </div>
    </div>
  );
}
