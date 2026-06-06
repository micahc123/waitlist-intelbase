"use client";

import "./ad-engine.css";
import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { ramp } from "@/lib/os-demo/timeline";
import { CREATIVES } from "@/lib/os-demo/fixtures";
import { wobble, climb, logTail } from "@/lib/os-demo/telemetry";
import { Panel } from "@/components/os/ui/frame";
import { Sparkline } from "@/components/os/ui/sparkline";

const EASE = [0.16, 1, 0.3, 1] as const;
const BAR_MAX = 70;

const MINT = "#7df5c8";
const COOL = "#6f7aa8";
const ROSE = "#ff8fb1";

const smooth = (x: number) => x * x * (3 - 2 * x);

// Per-creative impressions/CTR, deterministic and stable per seed.
const CREATIVE_META: Record<string, { imp: number; ctr: number; seed: number }> = {
  c1: { imp: 18420, ctr: 3.1, seed: 11 },
  c2: { imp: 11260, ctr: 2.2, seed: 23 },
  c3: { imp: 8740, ctr: 1.7, seed: 31 },
};

// A short deterministic sparkline for each row.
function spark(seed: number, t: number, rising: boolean, n = 16) {
  return Array.from({ length: n }, (_, i) => {
    const drift = rising ? i * 0.6 : -i * 0.35;
    return wobble(seed + i, t * 0.5, 20 + drift, 2.2, 0.8);
  });
}

const N = 36; // points in the spend/roas chart
const CW = 560; // chart viewBox width
const CH = 168; // chart viewBox height
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 16;

function buildSeries(t: number) {
  const spend = Array.from({ length: N }, (_, i) =>
    wobble(i * 7 + 3, t * 0.15 + i * 0.32, 100, 16, 1),
  );
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

// ── AI-generated ad variants (deterministic) ──
type Variant = {
  id: string;
  headline: string;
  primary: string;
  grad: string;
  live?: boolean;
};
const VARIANTS: Variant[] = [
  {
    id: "v1",
    headline: "Never miss another after-hours lead",
    primary: "Your AI front office answers in 3 seconds, day or night. Book the calls you used to lose.",
    grad: "linear-gradient(135deg, #1b3a5b 0%, #2f6f7a 55%, #7df5c8 130%)",
    live: true,
  },
  {
    id: "v2",
    headline: "Your front office, fully automated",
    primary: "Qualify, nurture and book every enquiry on autopilot. No new hires required.",
    grad: "linear-gradient(135deg, #2a2350 0%, #4b3b86 55%, #b79cff 130%)",
  },
  {
    id: "v3",
    headline: "Book more calls while you sleep",
    primary: "intelbase OS turns website visitors into booked calls around the clock.",
    grad: "linear-gradient(135deg, #4a2238 0%, #8a3556 55%, #ff8fb1 130%)",
  },
];

// Campaigns mini-table rows.
const CAMPAIGNS: {
  id: string;
  name: string;
  status: "Active" | "Learning";
  spend: number;
  roas: number;
  seed: number;
  rising: boolean;
}[] = [
  { id: "cm1", name: "After-hours - Broad HK", status: "Active", spend: 612, roas: 4.2, seed: 11, rising: true },
  { id: "cm2", name: "Lookalike 1% - Owners", status: "Active", spend: 348, roas: 3.4, seed: 23, rising: true },
  { id: "cm3", name: "Retarget - Site visitors", status: "Learning", spend: 196, roas: 2.1, seed: 31, rising: false },
];

function MetaMark() {
  return (
    <span className="ae-meta-mark" aria-hidden>
      <svg viewBox="0 0 24 16" width="22" height="15">
        <path
          d="M2.2 13.2C2.2 8.2 4.6 3.4 7.9 3.4c2.1 0 3.6 1.7 5 4 1.4-2.3 2.9-4 5-4 3.3 0 5.7 4.8 5.7 9.8 0 .1 0 .2-.02.3"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          transform="translate(-1 0)"
        />
      </svg>
    </span>
  );
}

export function AdEngine() {
  const { state } = useTimeline();
  const t = state.t;

  // Marquee reallocation ramp: bars interpolate spendStart -> spendEnd over 8s from t=50.
  const shift = ramp(t, 50, 8);

  // Top stat tiles.
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

  // Compact decisions log (folded into the right rail).
  const adDecisions = [
    { tag: "creative", text: "generated 3 new variants for After-hours" },
    { tag: "bid", text: "raised bid +6% on adset HK-12" },
    { tag: "publish", text: "published variant v1 to Meta" },
    { tag: "scale", text: "expanded lookalike to 2%" },
    { tag: "cap", text: "frequency cap set 3.0 on Broad" },
  ];
  const tail = logTail(t, 5, 2);
  const decisions = tail.map((l, i) => {
    const ad = adDecisions[i % adDecisions.length];
    return { id: l.id, tag: ad.tag, text: ad.text };
  });

  // Deterministic "generating" pulse for the 4th studio slot.
  const genPct = Math.round(40 + 55 * (0.5 + 0.5 * Math.sin(t * 0.9)));

  return (
    <div className="ae-root">
      <header className="os-screen-head ae-head">
        <div>
          <h2 className="os-screen-title">AI Ad Engine</h2>
          <p className="os-screen-sub">Generating creative and moving budget to what is working, automatically</p>
        </div>
        <div className="os-status-pill os-status-pill-pink">
          <span className="os-status-dot os-status-dot-pink" />
          Optimizing
        </div>
      </header>

      {/* ── Connected to Meta Ads bar ── */}
      <div className="ae-meta-bar">
        <div className="ae-meta-id">
          <MetaMark />
          <div className="ae-meta-acct">
            <span className="ae-meta-name">
              intelbase Studio
              <span className="ae-meta-conn">
                <span className="ae-conn-dot" />
                Connected
              </span>
            </span>
            <span className="ae-meta-sub">
              Meta Ads &middot; <span className="ae-mono">act_10293847</span>
            </span>
          </div>
        </div>
        <div className="ae-meta-chips">
          <span className="ae-chip is-live">
            <span className="ae-chip-dot" />
            Pixel Active
          </span>
          <span className="ae-chip is-live">
            <span className="ae-chip-dot" />
            Audiences synced
          </span>
          <span className="ae-chip">
            <span className="ae-mono">3</span> campaigns
          </span>
          <span className="ae-chip">
            CAPI <span className="ae-mono">7/7</span>
          </span>
        </div>
        <div className="ae-actions">
          <button type="button" className="ae-btn ae-btn-primary">
            <span className="ae-btn-glyph">+</span>
            Generate creative
          </button>
          <button type="button" className="ae-btn ae-btn-ghost">New campaign</button>
          <button type="button" className="ae-btn ae-btn-ghost">Sync audiences</button>
          <button type="button" className="ae-btn ae-btn-ghost ae-btn-meta">
            <MetaMark />
            Publish to Meta
          </button>
        </div>
      </div>

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

      {/* ── Main grid: studio + allocation (left) / chart + campaigns + log (right) ── */}
      <div className="ae-main">
        {/* LEFT column */}
        <div className="ae-col-left">
          {/* AI Creative Studio (centerpiece) */}
          <Panel className="ae-studio-panel">
            <div className="ae-studio-head">
              <div className="ae-studio-title">
                <h3>AI Creative Studio</h3>
                <span className="ae-spark-tag">
                  <span className="ae-spark-dot" />
                  generating
                </span>
              </div>
              <span className="os-tag">META READY</span>
            </div>
            <div className="ae-variants">
              {VARIANTS.map((v) => (
                <article className={`ae-card${v.live ? " is-live" : ""}`} key={v.id}>
                  <div className="ae-card-img" style={{ background: v.grad }}>
                    <span className="ae-ai-tag">AI generated</span>
                    {v.live && <span className="ae-live-tag">Live</span>}
                    <span className="ae-card-logo">in</span>
                  </div>
                  <div className="ae-card-body">
                    <div className="ae-card-page">
                      <span className="ae-card-avatar">ib</span>
                      <div className="ae-card-pageinfo">
                        <span className="ae-card-pagename">intelbase OS</span>
                        <span className="ae-card-sponsored">Sponsored</span>
                      </div>
                    </div>
                    <h4 className="ae-card-headline">{v.headline}</h4>
                    <p className="ae-card-primary">{v.primary}</p>
                    <button type="button" className="ae-card-cta">Book a call</button>
                  </div>
                </article>
              ))}
              {/* Generating slot (continuous generation affordance) */}
              <article className="ae-card ae-card-gen">
                <div className="ae-gen-shimmer" />
                <div className="ae-gen-body">
                  <div className="ae-gen-spinner" />
                  <span className="ae-gen-label">Generating variant v4</span>
                  <div className="ae-gen-bar">
                    <div className="ae-gen-fill" style={{ width: `${genPct}%` }} />
                  </div>
                  <button type="button" className="ae-gen-regen">Regenerate</button>
                </div>
              </article>
            </div>
          </Panel>

          {/* Budget allocation (reallocation beat preserved) */}
          <Panel title="Budget allocation" tag="AUTO" className="ae-alloc-panel">
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
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* RIGHT column */}
        <div className="ae-col-right">
          {/* Spend + ROAS chart */}
          <Panel className="ae-chart-panel">
            <div className="ae-chart-head">
              <div className="ae-chart-title">
                <h3>Spend and ROAS</h3>
                <span>last 24h</span>
              </div>
              <div className="ae-chart-legend">
                <span className="ae-leg-item">
                  <span className="ae-leg-swatch" style={{ background: ROSE }} />
                  Spend
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
              {[0, 1, 2, 3, 4].map((g) => {
                const y = PAD_T + ((CH - PAD_T - PAD_B) * g) / 4;
                return <line key={`h${g}`} className="ae-grid-line" x1={PAD_L} y1={y} x2={CW - PAD_R} y2={y} />;
              })}
              {[0, 1, 2, 3, 4, 5, 6].map((g) => {
                const x = PAD_L + ((CW - PAD_L - PAD_R) * g) / 6;
                return (
                  <g key={`v${g}`}>
                    <line className="ae-grid-line" x1={x} y1={PAD_T} x2={x} y2={CH - PAD_B} />
                    <text className="ae-axis-label" x={x + 2} y={CH - 5}>
                      {String(g * 4).padStart(2, "0")}:00
                    </text>
                  </g>
                );
              })}
              <path d={pathFor(spend, spendMin, spendMax, true)} fill="url(#ae-spend-grad)" />
              <path d={pathFor(spend, spendMin, spendMax, false)} fill="none" stroke={ROSE} strokeWidth={2} />
              <path d={pathFor(roas, roasMin, roasMax, true)} fill="url(#ae-roas-grad)" />
              <path d={pathFor(roas, roasMin, roasMax, false)} fill="none" stroke={MINT} strokeWidth={2} />
            </svg>
          </Panel>

          {/* Campaigns mini-table */}
          <Panel title="Campaigns" tag="META" className="ae-camp-panel">
            <div className="ae-camp-head">
              <span>Campaign</span>
              <span>Status</span>
              <span>Spend</span>
              <span>ROAS</span>
              <span>Trend</span>
            </div>
            <div className="ae-camp-list">
              {CAMPAIGNS.map((c) => (
                <div className="ae-camp-row" key={c.id}>
                  <span className="ae-camp-name">{c.name}</span>
                  <span className={`ae-camp-status${c.status === "Active" ? " is-active" : " is-learning"}`}>
                    <span className="ae-camp-statdot" />
                    {c.status}
                  </span>
                  <span className="ae-camp-spend">HK${c.spend.toLocaleString("en-US")}</span>
                  <span className={`ae-camp-roas${c.roas >= 3 ? " is-good" : ""}`}>{c.roas.toFixed(1)}x</span>
                  <span className="ae-camp-spark">
                    <Sparkline
                      points={spark(c.seed, t, c.rising, 14)}
                      color={c.roas >= 3 ? MINT : COOL}
                      w={64}
                      h={20}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Autonomous decisions (compact) */}
          <Panel title="Autonomous decisions" tag="LIVE" className="ae-log-panel">
            <div className="ae-log">
              {decisions.map((d) => (
                <div className="ae-log-row" key={d.id}>
                  <span className="ae-log-dot" style={{ background: MINT, boxShadow: `0 0 8px ${MINT}88` }} />
                  <span className="ae-log-tag">{d.tag}</span>
                  <span className="ae-log-text">{d.text}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
