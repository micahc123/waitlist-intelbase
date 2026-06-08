// Insights - the reporting dashboard. Hand-rolled SVG charts (no chart lib):
//   - KPI tiles from getOverviewMetrics (via /api/app/overview)
//   - a leads-over-time area/line (a deterministic 14-point series derived from
//     the live leads so it is stable across renders, not random)
//   - a conversion FUNNEL (New -> Qualified -> Booked -> Won from leadStageCounts)
//   - pipeline-by-source bars (summed from the live leads' value_cents)
//   - an agent-activity bar (counts of recent actions per agent)
// Honest numbers, empty states, legends, tabular numerals. Reads the existing
// /api/app/overview and /api/app/leads endpoints (both serve demo data with no keys).

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  CalendarCheck,
  Timer,
  Percent,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import type {
  Lead,
  LeadStageCounts,
  OverviewMetrics,
} from "@/lib/db/types";
import "./insights.css";

interface RecentAction {
  id: string;
  agent_id: string;
  created_at: string;
}

const AGENT_NAMES: Record<string, string> = {
  concierge: "Concierge",
  inbox: "Inbox",
  scheduler: "Scheduler",
  leadgen: "Leadgen",
  nurture: "Nurture",
  ops: "Ops",
};

function hkdShort(cents: number): string {
  const dollars = Math.round(cents / 100);
  if (dollars >= 1000) return `HK$${(dollars / 1000).toFixed(1)}k`;
  return `HK$${dollars.toLocaleString("en-HK")}`;
}

function hkdFull(cents: number): string {
  return `HK$${Math.round(cents / 100).toLocaleString("en-HK")}`;
}

// Deterministic 14-point daily series derived from the leads list: each lead is
// bucketed into the day it was created (relative to today), so the chart reflects
// real arrival timing rather than random noise. Days with no leads read zero.
function leadsSeries(leads: Lead[]): number[] {
  const days = 14;
  const buckets = new Array(days).fill(0);
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  for (const l of leads) {
    const age = Math.floor((now - new Date(l.created_at).getTime()) / DAY);
    if (age >= 0 && age < days) {
      buckets[days - 1 - age] += 1; // oldest left, today right
    }
  }
  return buckets;
}

export function Insights() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recent, setRecent] = useState<RecentAction[] | null>(null);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [stages, setStages] = useState<LeadStageCounts | null>(null);
  const [pipeline, setPipeline] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetch("/api/app/overview")
      .then((r) => r.json())
      .then((d: { metrics: OverviewMetrics; recent: RecentAction[] }) => {
        if (!active) return;
        setMetrics(d.metrics ?? null);
        setRecent(d.recent ?? []);
      })
      .catch(() => {
        if (active) setRecent([]);
      });
    fetch("/api/app/leads")
      .then((r) => r.json())
      .then(
        (d: {
          leads: Lead[];
          counts: LeadStageCounts;
          pipelineValueCents: number;
        }) => {
          if (!active) return;
          setLeads(d.leads ?? []);
          setStages(d.counts ?? null);
          setPipeline(d.pipelineValueCents ?? 0);
        },
      )
      .catch(() => {
        if (active) setLeads([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const series = useMemo(() => (leads ? leadsSeries(leads) : null), [leads]);

  const sourceBars = useMemo(() => {
    if (!leads) return null;
    const map = new Map<string, number>();
    for (const l of leads) {
      if (l.stage === "lost") continue;
      const src = l.source ?? "Unknown";
      map.set(src, (map.get(src) ?? 0) + (l.value_cents ?? 0));
    }
    return [...map.entries()]
      .map(([source, cents]) => ({ source, cents }))
      .sort((a, b) => b.cents - a.cents);
  }, [leads]);

  const agentBars = useMemo(() => {
    if (!recent) return null;
    const map = new Map<string, number>();
    for (const a of recent) {
      map.set(a.agent_id, (map.get(a.agent_id) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [recent]);

  const loading = metrics === null || leads === null;

  return (
    <div className="ibx insights">
      <ViewHead
        title="Insights"
        subtitle="The numbers that matter - pipeline, conversion, response speed, and how hard your agents are working - at a glance."
      />

      {/* KPI tiles */}
      <div className="ins-kpis">
        <Kpi
          icon={<TrendingUp size={16} />}
          label="Leads this week"
          value={metrics ? String(metrics.leadsThisWeek) : "--"}
          accent="var(--ib-blue)"
        />
        <Kpi
          icon={<CalendarCheck size={16} />}
          label="Bookings"
          value={metrics ? String(metrics.bookings) : "--"}
          accent="var(--ib-mint)"
        />
        <Kpi
          icon={<Percent size={16} />}
          label="Conversion"
          value={metrics ? `${Math.round(metrics.conversionRate * 100)}%` : "--"}
          accent="var(--ib-violet)"
        />
        <Kpi
          icon={<Timer size={16} />}
          label="Avg response"
          value={metrics ? `${metrics.responseTimeSeconds}s` : "--"}
          accent="var(--ib-amber)"
        />
        <Kpi
          icon={<MessagesSquare size={16} />}
          label="Messages handled"
          value={metrics ? metrics.messagesHandled.toLocaleString() : "--"}
          accent="var(--ib-cyan)"
        />
        <Kpi
          icon={<Wallet size={16} />}
          label="Pipeline value"
          value={metrics ? hkdShort(pipeline || metrics.pipelineValueCents) : "--"}
          accent="var(--ib-pink)"
        />
      </div>

      <div className="ins-grid">
        {/* leads over time */}
        <Panel title="Leads over time" sub="Last 14 days">
          {series ? (
            <AreaChart series={series} />
          ) : (
            <ChartSkeleton height={180} />
          )}
        </Panel>

        {/* conversion funnel */}
        <Panel title="Conversion funnel" sub="New to Won">
          {stages ? <Funnel stages={stages} /> : <ChartSkeleton height={180} />}
        </Panel>

        {/* pipeline by source */}
        <Panel title="Pipeline by source" sub="Open value, HK$">
          {sourceBars ? (
            sourceBars.length > 0 ? (
              <SourceBars bars={sourceBars} />
            ) : (
              <EmptyChart label="No open pipeline yet" />
            )
          ) : (
            <ChartSkeleton height={180} />
          )}
        </Panel>

        {/* agent activity */}
        <Panel title="Agent activity" sub="Recent actions per agent">
          {agentBars ? (
            agentBars.length > 0 ? (
              <AgentBars bars={agentBars} />
            ) : (
              <EmptyChart label="No agent actions yet" />
            )
          ) : (
            <ChartSkeleton height={180} />
          )}
        </Panel>
      </div>

      {loading && <span className="ins-sr" role="status">Loading insights</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI tile
// ---------------------------------------------------------------------------
function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="ins-kpi">
      <span className="ins-kpi-icon" style={{ color: accent }}>
        {icon}
      </span>
      <span className="ins-kpi-label">{label}</span>
      <span className="ins-kpi-value">{value}</span>
    </div>
  );
}

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ibx-panel ins-panel">
      <header className="ins-panel-head">
        <span className="ins-panel-title">{title}</span>
        <span className="ins-panel-sub">{sub}</span>
      </header>
      <div className="ins-panel-body">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Leads over time - area + line, hand-rolled SVG
// ---------------------------------------------------------------------------
function AreaChart({ series }: { series: number[] }) {
  const W = 520;
  const H = 180;
  const padL = 30;
  const padR = 12;
  const padT = 14;
  const padB = 24;
  const max = Math.max(1, ...series);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = series.length;

  const x = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  const linePts = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPath =
    `M ${x(0)},${padT + innerH} ` +
    series.map((v, i) => `L ${x(i)},${y(v)}`).join(" ") +
    ` L ${x(n - 1)},${padT + innerH} Z`;

  const ticks = [0, Math.ceil(max / 2), max];
  const total = series.reduce((s, v) => s + v, 0);

  return (
    <div className="ins-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Leads over the last ${n} days. ${total} total.`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="insArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ib-blue)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--ib-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              className="ins-gridline"
            />
            <text x={padL - 6} y={y(t) + 3} className="ins-axis-y" textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#insArea)" />
        <polyline
          points={linePts}
          fill="none"
          stroke="var(--ib-blue)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* last point marker */}
        <circle cx={x(n - 1)} cy={y(series[n - 1])} r={3} fill="var(--ib-blue)" />

        {/* x labels (first / mid / last) */}
        <text x={x(0)} y={H - 6} className="ins-axis-x" textAnchor="start">
          -{n - 1}d
        </text>
        <text x={x(Math.floor((n - 1) / 2))} y={H - 6} className="ins-axis-x" textAnchor="middle">
          -{Math.floor((n - 1) / 2)}d
        </text>
        <text x={x(n - 1)} y={H - 6} className="ins-axis-x" textAnchor="end">
          today
        </text>
      </svg>
      <div className="ins-legend">
        <span className="ins-legend-item">
          <span className="ins-legend-swatch" style={{ background: "var(--ib-blue)" }} />
          New leads · {total} in {n}d
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversion funnel
// ---------------------------------------------------------------------------
function Funnel({ stages }: { stages: LeadStageCounts }) {
  // Funnel = cumulative reach at each stage (later stages imply they passed
  // earlier ones). New is the widest; Won the narrowest.
  const steps = [
    { key: "new", label: "New", color: "var(--ib-blue)" },
    { key: "qualified", label: "Qualified", color: "var(--ib-cyan)" },
    { key: "booked", label: "Booked", color: "var(--ib-violet)" },
    { key: "won", label: "Won", color: "var(--ib-mint)" },
  ] as const;

  const reach = {
    new: stages.new + stages.qualified + stages.booked + stages.won,
    qualified: stages.qualified + stages.booked + stages.won,
    booked: stages.booked + stages.won,
    won: stages.won,
  };
  const top = Math.max(1, reach.new);

  return (
    <div className="ins-funnel">
      {steps.map((s, i) => {
        const value = reach[s.key];
        const pct = (value / top) * 100;
        const conv =
          i === 0 ? 100 : Math.round((value / Math.max(1, reach[steps[i - 1].key])) * 100);
        return (
          <div key={s.key} className="ins-funnel-row">
            <span className="ins-funnel-label">{s.label}</span>
            <div className="ins-funnel-track">
              <div
                className="ins-funnel-bar"
                style={{ width: `${Math.max(pct, value > 0 ? 6 : 0)}%`, background: s.color }}
              >
                <span className="ins-funnel-value">{value}</span>
              </div>
            </div>
            <span className="ins-funnel-conv">{i === 0 ? "--" : `${conv}%`}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline by source - horizontal bars
// ---------------------------------------------------------------------------
const SOURCE_COLOR: Record<string, string> = {
  Web: "var(--ib-blue)",
  Ads: "var(--ib-violet)",
  WhatsApp: "var(--ib-mint)",
  Referral: "var(--ib-amber)",
};

function SourceBars({ bars }: { bars: Array<{ source: string; cents: number }> }) {
  const max = Math.max(1, ...bars.map((b) => b.cents));
  return (
    <div className="ins-hbars">
      {bars.map((b) => (
        <div key={b.source} className="ins-hbar-row">
          <span className="ins-hbar-label">{b.source}</span>
          <div className="ins-hbar-track">
            <div
              className="ins-hbar-fill"
              style={{
                width: `${(b.cents / max) * 100}%`,
                background: SOURCE_COLOR[b.source] ?? "var(--ib-text-3)",
              }}
            />
          </div>
          <span className="ins-hbar-value">{hkdFull(b.cents)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent activity - vertical bars
// ---------------------------------------------------------------------------
function AgentBars({ bars }: { bars: Array<{ agent: string; count: number }> }) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="ins-vbars">
      {bars.map((b) => (
        <div key={b.agent} className="ins-vbar-col">
          <span className="ins-vbar-value">{b.count}</span>
          <div className="ins-vbar-track">
            <div
              className="ins-vbar-fill"
              style={{ height: `${(b.count / max) * 100}%` }}
            />
          </div>
          <span className="ins-vbar-label">
            {AGENT_NAMES[b.agent] ?? b.agent}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// shared placeholders
// ---------------------------------------------------------------------------
function ChartSkeleton({ height }: { height: number }) {
  return <div className="ins-skel" style={{ height }} aria-hidden="true" />;
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="ins-empty-chart">
      <BarChart3 size={20} />
      <span>{label}</span>
    </div>
  );
}
