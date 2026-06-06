"use client";

import "./overview.css";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { STORY } from "@/lib/os-demo/timeline";
import { AGENTS, KPIS } from "@/lib/os-demo/fixtures";
import { wobble, climb, gauge01, logTail } from "@/lib/os-demo/telemetry";
import { Panel, Dot } from "@/components/os/ui/frame";
import { Kpi } from "@/components/os/ui/kpi";
import { Feed } from "@/components/os/ui/feed";
import { Sparkline } from "@/components/os/ui/sparkline";

const smooth = (x: number) => x * x * (3 - 2 * x);

// Distinct tint per KPI card so the row reads as four confident metrics.
const KPI_ORDER = [
  { key: "answered", color: "#6ea8ff" },
  { key: "qualified", color: "#7df5c8" },
  { key: "booked", color: "#ffd166" },
  { key: "roas", color: "#b79cff" },
] as const;

function series(base: number, value: number) {
  return Array.from({ length: 12 }, (_, i) => base + (value - base) * smooth(i / 11));
}

// A short deterministic spark series sampled from wobble around `now`.
function sparkSeries(seed: number, t: number, base: number, amp: number, freq: number, n = 18) {
  return Array.from({ length: n }, (_, i) => wobble(seed, t - (n - 1 - i) * 0.6, base, amp, freq));
}

// Secondary live-metric tiles. Each derives a value, a delta sign, and a spark.
const TILES = [
  { seed: 11, label: "Avg response", base: 2.8, amp: 0.5, freq: 0.9, color: "#6ea8ff", fmt: (v: number) => `${v.toFixed(1)}s`, invert: true },
  { seed: 23, label: "Qualification rate", base: 38, amp: 4, freq: 0.7, color: "#7df5c8", fmt: (v: number) => `${Math.round(v)}%` },
  { seed: 37, label: "Booking rate", base: 22, amp: 3, freq: 0.8, color: "#ffd166", fmt: (v: number) => `${Math.round(v)}%` },
  { seed: 41, label: "Pipeline value", base: 1.21, amp: 0.06, freq: 0.5, color: "#b79cff", fmt: (v: number) => `HK$${v.toFixed(2)}M` },
  { seed: 53, label: "Replies / hr", base: 47, amp: 7, freq: 1.1, color: "#ff8fb1", fmt: (v: number) => `${Math.round(v)}` },
  { seed: 67, label: "Throughput", base: 38, amp: 6, freq: 1.3, color: "#6ea8ff", fmt: (v: number) => `${Math.round(v)} req/s` },
] as const;

// Channel/source mix (static base mix, fills animate in).
const CHANNELS = [
  { label: "Website", pct: 48, color: "#6ea8ff" },
  { label: "WhatsApp", pct: 22, color: "#7df5c8" },
  { label: "Ads", pct: 18, color: "#ff8fb1" },
  { label: "Referral", pct: 12, color: "#b79cff" },
] as const;

// Distinct seeds per agent for the live grid.
const AGENT_SEED: Record<string, number> = {
  concierge: 3,
  leadgen: 9,
  nurture: 15,
  ads: 21,
  control: 27,
};

// Build the throughput area-chart path from ~40 wobble samples (last 60 min).
function ThroughputChart({ t }: { t: number }) {
  const N = 42;
  const W = 1000;
  const H = 220;
  const pad = 6;
  const pts = Array.from({ length: N }, (_, i) =>
    wobble(5, t * 0.6 - (N - 1 - i) * 0.9, 1180, 280, 0.5) +
    wobble(13, t * 0.6 - (N - 1 - i) * 0.9, 0, 120, 1.4)
  );
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (N - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (H - pad * 2);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(N - 1).toFixed(1)} ${(H - pad).toFixed(1)} L${x(0).toFixed(1)} ${(H - pad).toFixed(1)} Z`;
  const grid = [0.25, 0.5, 0.75];
  return (
    <svg className="ov-thru-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ov-thru-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ea8ff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#6ea8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={pad + g * (H - pad * 2)}
          y2={pad + g * (H - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill="url(#ov-thru-grad)" stroke="none" />
      <path d={line} fill="none" stroke="#6ea8ff" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

export function Overview() {
  const { state } = useTimeline();
  const t = state.t;

  const lines = STORY.filter((e) => state.has(e.id) && e.feed)
    .map((e) => ({ id: e.id, text: e.feed! }))
    .reverse();

  const logs = logTail(t, 8, 3);
  const thruNow = Math.round(wobble(67, t, 38, 6, 1.3));

  return (
    <div className="os-overview">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Command center</h2>
          <p className="os-screen-sub">Everything intelbase OS is doing right now</p>
        </div>
        <div className="os-status-pill">
          <span className="os-status-dot" />
          5 agents online
        </div>
      </header>

      <div className="os-kpi-row">
        {KPI_ORDER.map(({ key, color }) => {
          const k = KPIS[key];
          const value = k.base + (k.end - k.base) * state.progress;
          return (
            <Kpi
              key={key}
              label={k.label}
              value={value}
              unit={k.unit}
              series={series(k.base, value)}
              color={color}
            />
          );
        })}
      </div>

      {/* Secondary live-metric strip */}
      <div className="ov-strip">
        {TILES.map((tile) => {
          const v = wobble(tile.seed, t, tile.base, tile.amp, tile.freq);
          const prev = wobble(tile.seed, t - 1.2, tile.base, tile.amp, tile.freq);
          const rising = v >= prev;
          const good = tile.invert ? !rising : rising;
          const deltaPct = prev !== 0 ? ((v - prev) / Math.abs(prev)) * 100 : 0;
          return (
            <div className="ov-tile" key={tile.label}>
              <div className="ov-tile-top">
                <span className="ov-tile-val">{tile.fmt(v)}</span>
                <span className={`ov-tile-delta ${good ? "ov-tile-up" : "ov-tile-down"}`}>
                  {rising ? "+" : ""}
                  {deltaPct.toFixed(1)}%
                </span>
              </div>
              <span className="ov-tile-label">{tile.label}</span>
              <div className="ov-tile-spark">
                <Sparkline
                  points={sparkSeries(tile.seed, t, tile.base, tile.amp, tile.freq)}
                  color={tile.color}
                  w={140}
                  h={22}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {state.has("summary") && (
          <motion.div
            className="os-summary-banner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="os-summary-glyph" />
            <div className="os-summary-copy">
              <strong>12 actions taken autonomously this hour</strong>
              <span>intelbase OS ran the front office with zero human touches</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="os-grid-2">
        <Panel title="Activity" tag="LIVE" className="os-activity-panel">
          <Feed lines={lines} />
        </Panel>

        <Panel title="Agents" className="os-agents-panel">
          <div className="os-agent-list">
            {AGENTS.map((a) => (
              <div key={a.id} className="os-agent-row">
                <Dot color={a.color} />
                <span className="os-agent-name">{a.name}</span>
                <span className="os-agent-status">online</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Dense lower telemetry grid */}
      <div className="ov-lower">
        <Panel title="Throughput" tag="60 MIN" className="ov-throughput">
          <div className="ov-thru-head">
            <div className="ov-thru-now">
              <span className="ov-thru-num">{thruNow}</span>
              <span className="ov-thru-unit">req/s sustained</span>
            </div>
            <div className="ov-thru-legend">
              <span className="ov-thru-leg">
                <span className="ov-thru-leg-swatch" style={{ background: "#6ea8ff" }} />
                requests
              </span>
              <span className="ov-thru-leg">
                <span className="ov-thru-leg-swatch" style={{ background: "rgba(110,168,255,.3)" }} />
                volume
              </span>
            </div>
          </div>
          <div className="ov-thru-chart">
            <ThroughputChart t={t} />
          </div>
          <div className="ov-thru-axis">
            <span>-60m</span>
            <span>-45m</span>
            <span>-30m</span>
            <span>-15m</span>
            <span>now</span>
          </div>
        </Panel>

        <Panel title="System events" tag="STREAM" className="ov-events">
          <ul className="ov-log">
            {logs.map((l, i) => {
              const ts = Math.max(0, Math.floor(t) - i);
              const mm = String(Math.floor(ts / 60)).padStart(2, "0");
              const ss = String(ts % 60).padStart(2, "0");
              return (
                <li className="ov-log-line" key={l.id}>
                  <span className="ov-log-ts">{mm}:{ss}</span>
                  <span className="ov-log-text">{l.text}</span>
                </li>
              );
            })}
            <li className="ov-log-cursor">
              <span className="ov-log-caret" />
              <span>awaiting next event</span>
            </li>
          </ul>
        </Panel>

        <Panel title="Agent activity" tag="LIVE" className="ov-agents-live">
          <div className="ov-agrid">
            {AGENTS.map((a) => {
              const seed = AGENT_SEED[a.id] ?? 5;
              const req = Math.round(wobble(seed, t, 34, 9, 1.2));
              const actions = Math.floor(climb(t, 120 + seed * 4, 0.9, seed, 2));
              return (
                <div className="ov-acard" key={a.id}>
                  <div className="ov-acard-top">
                    <span className="ov-acard-dot" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                    <span className="ov-acard-name">{a.name}</span>
                  </div>
                  <div className="ov-acard-req">
                    <span className="ov-acard-req-val">{req}</span>
                    <span className="ov-acard-req-unit">req/min</span>
                  </div>
                  <div className="ov-acard-spark">
                    <Sparkline points={sparkSeries(seed, t, 34, 9, 1.2)} color={a.color} w={120} h={24} />
                  </div>
                  <div className="ov-acard-foot">
                    <span className="ov-acard-foot-label">actions today</span>
                    <span className="ov-acard-foot-val">{actions.toLocaleString("en-US")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Source mix" className="ov-channels">
          <div className="ov-chan">
            {CHANNELS.map((c, i) => {
              const live = c.pct * (0.94 + 0.06 * gauge01(i * 7 + 2, t));
              return (
                <div className="ov-chan-row" key={c.label}>
                  <span className="ov-chan-label">{c.label}</span>
                  <div className="ov-chan-track">
                    <div className="ov-chan-fill" style={{ width: `${live}%`, background: c.color }} />
                  </div>
                  <span className="ov-chan-val">{Math.round(live)}%</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
