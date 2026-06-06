"use client";

import "./nurture.css";
import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { wobble, climb, gauge01, logTail } from "@/lib/os-demo/telemetry";
import { SEQUENCES } from "@/lib/os-demo/fixtures";
import { Panel } from "@/components/os/ui/frame";
import { Sparkline } from "@/components/os/ui/sparkline";

const EASE = [0.16, 1, 0.3, 1] as const;

// Color palette per sequence slot (7 slots max)
const SEQ_COLORS = [
  "#6ea8ff",
  "#7df5c8",
  "#ffd166",
  "#b79cff",
  "#ff8fb1",
  "#5ec4ff",
  "#a3f7a0",
] as const;

// Local extra sequences (deterministic, no fixture dependency)
const EXTRA_SEQUENCES = [
  { id: "s4", name: "Webinar follow-up",   steps: 5, active: 47, replies: 9 },
  { id: "s5", name: "Quote not accepted",  steps: 4, active: 33, replies: 5 },
  { id: "s6", name: "Onboarding drip",     steps: 6, active: 58, replies: 14 },
  { id: "s7", name: "Win-back 180d",       steps: 3, active: 22, replies: 3 },
] as const;

const ALL_SEQUENCES = [...SEQUENCES, ...EXTRA_SEQUENCES];

// Total contacts = sum of all active
const TOTAL_CONTACTS = ALL_SEQUENCES.reduce((s, seq) => s + seq.active, 0);

// Deliverability rows (static-ish, gauge01 provides a gentle wobble on delivered/opened)
const DELIV = [
  { label: "Delivered",  pct: 98.6, color: "#7df5c8", staticPct: true  },
  { label: "Opened",     pct: 61,   color: "#6ea8ff",  staticPct: false },
  { label: "Replied",    pct: 14,   color: "#ffd166",  staticPct: true  },
  { label: "Bounced",    pct: 0.8,  color: "#ff8fb1",  staticPct: true  },
] as const;

// Channel split
const CHANNELS = [
  { name: "Email",     pct: 64, color: "#6ea8ff"  },
  { name: "WhatsApp",  pct: 26, color: "#7df5c8"  },
  { name: "SMS",       pct: 10, color: "#ffd166"  },
] as const;

// Build a deterministic 36-point sends-over-24h series
function sendsSeries(t: number): number[] {
  return Array.from({ length: 36 }, (_, i) => {
    const hour = i / 35;
    const base = 18 + 14 * Math.sin(Math.PI * hour);   // daily arc
    return Math.max(0, wobble(i * 7, t * 0.08, base, 5, 0.6));
  });
}

// Build sparkline points for a single sequence (deterministic per seed)
function seqSparkline(seed: number, t: number): number[] {
  return Array.from({ length: 12 }, (_, i) =>
    Math.max(0, wobble(seed + i, t * 0.12, 50, 22, 0.55 + seed * 0.07)),
  );
}

// Render the 24h area/line chart as an SVG with gridlines
function SendsChart({ series }: { series: number[] }) {
  const W = 400;
  const H = 72;
  const pts = series;
  const min = 0;
  const max = Math.max(...pts, 1);

  const px = (i: number) => ((i / (pts.length - 1)) * W).toFixed(1);
  const py = (v: number) => (H - ((v - min) / (max - min)) * H).toFixed(1);

  // Line path
  const linePath = pts.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)} ${py(v)}`).join(" ");

  // Area path (close down to bottom)
  const areaPath = linePath + ` L${px(pts.length - 1)} ${H} L${px(0)} ${H} Z`;

  // 4 horizontal gridlines
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = (H - f * H).toFixed(1);
    const label = Math.round(min + f * (max - min));
    return { y, label };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 12}`}
      className="nu-chart-svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="nu-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6ea8ff" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#6ea8ff" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Horizontal gridlines */}
      {gridLines.map(({ y, label }) => (
        <g key={y}>
          <line x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
          <text x="3" y={Number(y) - 2} fontSize="8" fill="rgba(255,255,255,.22)" fontVariantNumeric="tabular-nums">
            {label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#nu-area-grad)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#6ea8ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Nurture() {
  const { state } = useTimeline();
  const t = state.t;

  // Live stat values
  const sentToday     = Math.floor(climb(t, 840, 0.7, 3, 2));
  const openRate      = wobble(11, t, 61, 1.2, 0.18).toFixed(1);
  const replyRate     = wobble(7,  t, 14, 0.4, 0.14).toFixed(1);
  const repliesWeek   = Math.floor(climb(t, 34, 0.045, 5, 0.3));
  const avgSteps      = (
    ALL_SEQUENCES.reduce((s, seq) => s + seq.steps, 0) / ALL_SEQUENCES.length
  ).toFixed(1);

  // Sends chart
  const sends = sendsSeries(t);

  // Reactivation beat (t=62)
  const reactivated = state.has("reactivation");

  // Live feed: logTail + nurture-specific lines mixed in
  const nurtureFeed = [
    { id: "n1", text: "nurture  step 2 queued for 14 contacts"   },
    { id: "n2", text: "nurture  open rate 61% on step 1 batch"   },
    { id: "n3", text: "nurture  sms delivered to 9 of 9"          },
    { id: "n4", text: "nurture  reactivation seq started l-1988" },
  ];
  const liveFeed = logTail(t, 8, 2.5);
  // Interleave: nurtureFeed lines appear every ~2 system lines
  const feedRows: { id: string; text: string; color?: string }[] = [];
  let ni = 0;
  liveFeed.forEach((row, i) => {
    feedRows.push({ id: row.id, text: row.text });
    if ((i + 1) % 2 === 0 && ni < nurtureFeed.length) {
      feedRows.push({ ...nurtureFeed[ni], color: "#7df5c8" });
      ni++;
    }
  });

  return (
    <div className="nu-root">
      {/* Header */}
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Nurture</h2>
          <p className="os-screen-sub">Following up with every lead on its own schedule</p>
        </div>
        <div className="os-status-pill os-status-pill-amber">
          <span className="os-status-dot os-status-dot-amber" />
          {ALL_SEQUENCES.length} sequences running
        </div>
      </header>

      {/* 6-tile stat strip */}
      <div className="nu-stats">
        <div className="nu-stat">
          <span className="nu-stat-val nu-stat-val--blue">
            {TOTAL_CONTACTS.toLocaleString("en-US")}
          </span>
          <span className="nu-stat-label">Contacts in nurture</span>
        </div>
        <div className="nu-stat">
          <span className="nu-stat-val">
            {sentToday.toLocaleString("en-US")}
          </span>
          <span className="nu-stat-label">Sent today</span>
        </div>
        <div className="nu-stat">
          <span className="nu-stat-val nu-stat-val--mint">{openRate}%</span>
          <span className="nu-stat-label">Open rate</span>
        </div>
        <div className="nu-stat">
          <span className="nu-stat-val nu-stat-val--amber">{replyRate}%</span>
          <span className="nu-stat-label">Reply rate</span>
        </div>
        <div className="nu-stat">
          <span className="nu-stat-val nu-stat-val--mint">
            {repliesWeek}
          </span>
          <span className="nu-stat-label">Replies this week</span>
        </div>
        <div className="nu-stat">
          <span className="nu-stat-val nu-stat-val--violet">{avgSteps}</span>
          <span className="nu-stat-label">Avg steps</span>
        </div>
      </div>

      {/* 3-column body */}
      <div className="nu-body">

        {/* Left: sequences */}
        <Panel title="Active sequences" className="nu-seq-col">
          <div className="nu-seq-list">
            {ALL_SEQUENCES.map((seq, i) => {
              const color = SEQ_COLORS[i % SEQ_COLORS.length];
              const BAR_MAX = 140;
              const pct = Math.min(100, (seq.active / BAR_MAX) * 100);
              const openPct = wobble(i * 13 + 3, t, 52 + i * 2.3, 3.5, 0.22).toFixed(0);
              const spark = seqSparkline(i * 17 + 5, t);
              return (
                <div className="nu-seq-row" key={seq.id}>
                  <div className="nu-seq-top">
                    <span className="nu-seq-name">{seq.name}</span>
                    <span className="nu-seq-steps">{seq.steps} steps</span>
                  </div>
                  <div className="nu-seq-track">
                    <div
                      className="nu-seq-fill"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        boxShadow: `0 0 8px ${color}55`,
                      }}
                    />
                  </div>
                  <div className="nu-seq-figs">
                    <div className="nu-seq-left">
                      <span className="nu-seq-active" style={{ color }}>
                        {seq.active} active
                      </span>
                      <span className="nu-seq-sep">-</span>
                      <span className="nu-seq-replies">{seq.replies} replies</span>
                      <span className="nu-seq-open">{openPct}% open</span>
                    </div>
                    <Sparkline points={spark} color={color} w={60} h={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Centre: chart + deliverability + channels */}
        <div className="nu-mid-col">
          {/* Sends over time */}
          <Panel title="Sends (24h)" className="nu-chart-panel">
            <div className="nu-chart-wrap">
              <SendsChart series={sends} />
            </div>
          </Panel>

          {/* Deliverability */}
          <Panel title="Deliverability" className="nu-deliv-panel">
            <div className="nu-deliv-rows">
              {DELIV.map((d, i) => {
                const live = d.staticPct
                  ? d.pct
                  : wobble(i * 9 + 1, t, d.pct, 0.8, 0.15);
                const display =
                  d.pct < 10
                    ? live.toFixed(1) + "%"
                    : Math.round(live) + "%";
                return (
                  <div className="nu-deliv-row" key={d.label}>
                    <div className="nu-deliv-head">
                      <span className="nu-deliv-label">{d.label}</span>
                      <span className="nu-deliv-val" style={{ color: d.color }}>
                        {display}
                      </span>
                    </div>
                    <div className="nu-deliv-track">
                      <div
                        className="nu-deliv-fill"
                        style={{
                          width: `${Math.min(100, live)}%`,
                          background: d.color,
                          boxShadow: `0 0 6px ${d.color}44`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Channels */}
          <Panel title="Channels" className="nu-chan-panel">
            <div className="nu-chan-rows">
              {CHANNELS.map((ch) => (
                <div className="nu-chan-row" key={ch.name}>
                  <div className="nu-chan-head">
                    <span className="nu-chan-name">{ch.name}</span>
                    <span className="nu-chan-pct" style={{ color: ch.color }}>
                      {ch.pct}%
                    </span>
                  </div>
                  <div className="nu-chan-track">
                    <div
                      className="nu-chan-fill"
                      style={{
                        width: `${ch.pct}%`,
                        background: ch.color,
                        boxShadow: `0 0 6px ${ch.color}44`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right: activity feed */}
        <Panel title="Recent activity" tag="LIVE" className="nu-feed-col">
          <div className="nu-feed">
            {/* Money moment: reactivation card pinned at top */}
            <AnimatePresence>
              {reactivated && (
                <motion.div
                  key="reactivated"
                  className="nu-react"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span className="nu-react-glyph" />
                  <div className="nu-react-copy">
                    <strong>Reactivated: a dormant lead just replied</strong>
                    <span>Reactivation 90d sequence brought them back</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streaming log + nurture-specific entries */}
            {feedRows.map((row) => (
              <motion.div
                key={row.id}
                className="nu-event"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <span
                  className="nu-event-dot"
                  style={{
                    background: row.color ?? "#4a5273",
                    boxShadow: row.color ? `0 0 5px ${row.color}` : undefined,
                  }}
                />
                <span>{row.text}</span>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
