"use client";

import "./ad-engine.css";
import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { ramp } from "@/lib/os-demo/timeline";
import { CREATIVES } from "@/lib/os-demo/fixtures";
import { wobble, climb, logTail } from "@/lib/os-demo/telemetry";
import { Panel } from "@/components/os/ui/frame";
import { Sparkline } from "@/components/os/ui/sparkline";
import { Bars } from "@/components/os/ui/bars";

const EASE = [0.16, 1, 0.3, 1] as const;
const BAR_MAX = 70;

const MINT = "#7df5c8";
const COOL = "#6f7aa8";
const ROSE = "#ff8fb1";

const smooth = (x: number) => x * x * (3 - 2 * x);

// Deterministic rising ROAS series from ~2.9 up to the current blended value.
function roasSeries(current: number) {
  const start = 2.9;
  return Array.from({ length: 14 }, (_, i) =>
    start + (current - start) * smooth(i / 13),
  );
}

// Per-creative impressions/CTR, deterministic and stable per seed.
const CREATIVE_META: Record<string, { imp: number; ctr: number; seed: number }> = {
  c1: { imp: 18420, ctr: 3.1, seed: 11 },
  c2: { imp: 11260, ctr: 2.2, seed: 23 },
  c3: { imp: 8740, ctr: 1.7, seed: 31 },
};

// A short deterministic sparkline for each creative row.
function creativeSpark(seed: number, t: number, rising: boolean) {
  return Array.from({ length: 16 }, (_, i) => {
    const drift = rising ? i * 0.6 : -i * 0.35;
    return wobble(seed + i, t * 0.5, 20 + drift, 2.2, 0.8);
  });
}

const N = 40; // points in the 24h dual-line chart
const CW = 920; // chart viewBox width
const CH = 230; // chart viewBox height
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 14;
const PAD_B = 18;

function buildSeries(t: number) {
  // Spend: organic wobble around HK$100/h with a deterministic phase from t.
  const spend = Array.from({ length: N }, (_, i) =>
    wobble(i * 7 + 3, t * 0.15 + i * 0.32, 100, 16, 1),
  );
  // ROAS: slow climb from ~2.9 to ~3.7 across the window, with light wobble.
  const roas = Array.from({ length: N }, (_, i) => {
    const base = 2.9 + 0.8 * smooth(i / (N - 1));
    return base + 0.12 * Math.sin(t * 0.2 + i * 0.5);
  });
  return { spend, roas };
}

function pathFor(vals: number[], min: number, max: number, area: boolean) {
  const span = max - min || 1;
  const innerW = CW - PAD_L - PAD_R;
  const innerH = CH - PAD_T - PAD_B;
  const pts = vals.map((v, i) => {
    const x = PAD_L + (i / (vals.length - 1)) * innerW;
    const y = PAD_T + innerH - ((v - min) / span) * innerH;
    return [x, y] as const;
  });
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  if (!area) return line;
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last[0].toFixed(1)} ${(CH - PAD_B).toFixed(1)} L${first[0].toFixed(1)} ${(CH - PAD_B).toFixed(1)} Z`;
}

export function AdEngine() {
  const { state } = useTimeline();
  const t = state.t;

  // Marquee reallocation ramp: bars interpolate spendStart -> spendEnd over 8s from t=50.
  const shift = ramp(t, 50, 8);

  // Top stat tiles, driven by loop progress / deterministic telemetry.
  const blendedRoas = 3.1 + (3.6 - 3.1) * state.progress;
  const costPerLead = Math.round(84 + (71 - 84) * state.progress);
  const impressions = Math.floor(climb(t, 412000, 1180, 5, 600));
  const conversions = Math.floor(climb(t, 184, 0.9, 9, 3));
  const ctr = wobble(2, t, 2.4, 0.18, 0.9);

  const moved = state.has("budget-shift");
  const winner = CREATIVES.find((c) => c.winner);

  const { spend, roas } = buildSeries(t);
  const spendMin = Math.min(...spend) - 6;
  const spendMax = Math.max(...spend) + 6;
  const roasMin = 2.6;
  const roasMax = 3.9;
  const spendNow = spend[spend.length - 1];

  // Ad-specific decision lines mixed with the live log tail.
  const adDecisions = [
    { tag: "bid", text: "raised bid +6% on adset HK-12" },
    { tag: "pause", text: "paused creative v3 (roas 1.1)" },
    { tag: "shift", text: `shifted HK$640 to ${winner?.name ?? "top creative"}` },
    { tag: "scale", text: "expanded lookalike to 2%" },
    { tag: "cap", text: "frequency cap set 3.0 on Broad" },
  ];
  const tail = logTail(t, 7, 2);
  const decisions = tail.map((l, i) => {
    const ad = adDecisions[i % adDecisions.length];
    // Interleave: even rows -> ad decision, odd rows -> system log line.
    if (i % 2 === 0) return { id: l.id, tag: ad.tag, text: ad.text, ad: true };
    return { id: l.id, tag: l.text.split("  ")[0], text: l.text.split("  ").slice(1).join("  "), ad: false };
  });

  const audRows = [
    { label: "After-hours searchers", value: 42, max: 42, color: MINT, sub: "42%" },
    { label: "Returning visitors", value: 24, max: 42, color: "#6ea8ff", sub: "24%" },
    { label: "Lookalike 1%", value: 20, max: 42, color: "#b79cff", sub: "20%" },
    { label: "Broad", value: 14, max: 42, color: COOL, sub: "14%" },
  ];

  return (
    <div className="ae-root">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Ad Engine</h2>
          <p className="os-screen-sub">Moving budget to what is working, automatically</p>
        </div>
        <div className="os-status-pill os-status-pill-pink">
          <span className="os-status-dot os-status-dot-pink" />
          Optimizing
        </div>
      </header>

      {/* ── Live stat strip ── */}
      <div className="ae-stats">
        <div className="ae-stat">
          <span className="ae-stat-val">HK$100</span>
          <span className="ae-stat-label">Daily spend</span>
        </div>
        <div className="ae-stat">
          <span className="ae-stat-delta">+0.5</span>
          <span className="ae-stat-val is-mint">{blendedRoas.toFixed(1)}x</span>
          <span className="ae-stat-label">Blended ROAS</span>
        </div>
        <div className="ae-stat">
          <span className="ae-stat-delta is-down">-13</span>
          <span className="ae-stat-val">HK${costPerLead}</span>
          <span className="ae-stat-label">Cost per lead</span>
        </div>
        <div className="ae-stat">
          <span className="ae-stat-val is-big">{impressions.toLocaleString("en-US")}</span>
          <span className="ae-stat-label">Impressions today</span>
        </div>
        <div className="ae-stat">
          <span className="ae-stat-val">{ctr.toFixed(1)}%</span>
          <span className="ae-stat-label">CTR</span>
        </div>
        <div className="ae-stat">
          <span className="ae-stat-val">{conversions.toLocaleString("en-US")}</span>
          <span className="ae-stat-label">Conversions today</span>
        </div>
      </div>

      {/* ── Wide spend + ROAS chart (centerpiece) ── */}
      <Panel className="ae-chart-panel">
        <div className="ae-chart-head">
          <div className="ae-chart-title">
            <h3>Spend and ROAS</h3>
            <span>last 24h</span>
          </div>
          <div className="ae-chart-legend">
            <span className="ae-leg-item">
              <span className="ae-leg-swatch" style={{ background: ROSE }} />
              Spend / h
              <span className="ae-leg-val">HK${Math.round(spendNow)}</span>
            </span>
            <span className="ae-leg-item">
              <span className="ae-leg-swatch" style={{ background: MINT }} />
              ROAS
              <span className="ae-leg-val">{roas[roas.length - 1].toFixed(2)}x</span>
            </span>
          </div>
        </div>
        <svg className="ae-chart-svg" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ae-spend-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ROSE} stopOpacity="0.28" />
              <stop offset="100%" stopColor={ROSE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ae-roas-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MINT} stopOpacity="0.22" />
              <stop offset="100%" stopColor={MINT} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* horizontal gridlines */}
          {[0, 1, 2, 3, 4].map((g) => {
            const y = PAD_T + ((CH - PAD_T - PAD_B) * g) / 4;
            return <line key={`h${g}`} className="ae-grid-line" x1={PAD_L} y1={y} x2={CW - PAD_R} y2={y} />;
          })}
          {/* vertical gridlines (every 4h ~ 7 ticks) */}
          {[0, 1, 2, 3, 4, 5, 6].map((g) => {
            const x = PAD_L + ((CW - PAD_L - PAD_R) * g) / 6;
            return (
              <g key={`v${g}`}>
                <line className="ae-grid-line" x1={x} y1={PAD_T} x2={x} y2={CH - PAD_B} />
                <text className="ae-axis-label" x={x + 2} y={CH - 6}>
                  {String((g * 4)).padStart(2, "0")}:00
                </text>
              </g>
            );
          })}
          {/* spend area + line */}
          <path d={pathFor(spend, spendMin, spendMax, true)} fill="url(#ae-spend-grad)" />
          <path d={pathFor(spend, spendMin, spendMax, false)} fill="none" stroke={ROSE} strokeWidth={2} />
          {/* roas area + line */}
          <path d={pathFor(roas, roasMin, roasMax, true)} fill="url(#ae-roas-grad)" />
          <path d={pathFor(roas, roasMin, roasMax, false)} fill="none" stroke={MINT} strokeWidth={2} />
        </svg>
      </Panel>

      {/* ── Lower three-column grid ── */}
      <div className="ae-lower">
        {/* Budget allocation */}
        <Panel title="Budget allocation" tag="AUTO">
          <AnimatePresence>
            {moved && (
              <motion.div
                key="callout"
                className="ae-callout"
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="ae-callout-glyph" />
                <div className="ae-callout-copy">
                  <strong>Budget moved to top creative: {winner?.name}</strong>
                  <span>The Ad Engine shifted spend toward the highest ROAS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ae-alloc-list">
            {CREATIVES.map((c) => {
              const spendV = c.spendStart + (c.spendEnd - c.spendStart) * shift;
              const pct = Math.min(100, (spendV / BAR_MAX) * 100);
              const color = c.winner ? MINT : COOL;
              const meta = CREATIVE_META[c.id];
              return (
                <div className={`ae-alloc${c.winner ? " is-winner" : ""}`} key={c.id}>
                  <div className="ae-alloc-top">
                    <span className="ae-alloc-name">
                      {c.name}
                      {c.winner && <span className="ae-badge">TOP</span>}
                    </span>
                    <span className="ae-alloc-roas">
                      <b>{c.roas}x</b> ROAS
                    </span>
                  </div>
                  <div className="ae-alloc-bar">
                    <div className="ae-alloc-track">
                      <div
                        className="ae-alloc-fill"
                        style={{
                          width: `${pct}%`,
                          background: color,
                          boxShadow: `0 0 14px ${color}66`,
                        }}
                      />
                    </div>
                    <span
                      className="ae-alloc-val"
                      style={c.winner ? { color: MINT } : undefined}
                    >
                      HK${Math.round(spendV)}
                    </span>
                  </div>
                  <div className="ae-alloc-meta">
                    <span className="ae-alloc-stats">
                      <span><b>{meta.imp.toLocaleString("en-US")}</b> impr</span>
                      <span><b>{meta.ctr.toFixed(1)}%</b> CTR</span>
                    </span>
                    <span className="ae-alloc-spark">
                      <Sparkline
                        points={creativeSpark(meta.seed, t, !!c.winner)}
                        color={color}
                        w={84}
                        h={22}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Audience breakdown */}
        <Panel title="Audience breakdown" tag="SEGMENTS">
          <div className="ae-aud">
            <Bars rows={audRows} />
          </div>
          <div className="ae-aud-foot">
            <div className="ae-aud-mini">
              <span className="ae-aud-mini-val is-mint">{ctr.toFixed(1)}%</span>
              <span className="ae-aud-mini-label">Avg CTR</span>
            </div>
            <div className="ae-aud-mini">
              <span className="ae-aud-mini-val">4.6%</span>
              <span className="ae-aud-mini-label">Conv. rate</span>
            </div>
            <div className="ae-aud-mini">
              <span className="ae-aud-mini-val">1.9</span>
              <span className="ae-aud-mini-label">Frequency</span>
            </div>
            <div className="ae-aud-mini">
              <span className="ae-aud-mini-val">8</span>
              <span className="ae-aud-mini-label">Active adsets</span>
            </div>
          </div>
        </Panel>

        {/* Performance + Autonomous decisions */}
        <Panel title="Autonomous decisions" tag="LIVE">
          <div className="ae-perf">
            <div>
              <div className="ae-perf-num">{blendedRoas.toFixed(1)}x</div>
              <div className="ae-perf-cap">Blended ROAS, trending up</div>
            </div>
            <Sparkline points={roasSeries(blendedRoas)} color={MINT} w={150} h={48} />
          </div>
          <div className="ae-log">
            {decisions.map((d) => (
              <div className="ae-log-row" key={d.id}>
                <span
                  className="ae-log-dot"
                  style={{
                    background: d.ad ? MINT : COOL,
                    boxShadow: d.ad ? `0 0 8px ${MINT}88` : undefined,
                  }}
                />
                <span className="ae-log-tag">{d.ad ? d.tag : "sys"}</span>
                <span className="ae-log-text">{d.text}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
