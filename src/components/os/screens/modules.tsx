"use client";

import "./modules.css";
import { motion } from "motion/react";
import { EXPANSION } from "@/lib/os-demo/fixtures";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { wobble, climb, gauge01 } from "@/lib/os-demo/telemetry";
import { Sparkline } from "@/components/os/ui/sparkline";

// Per-card visual config
const CARD_META: Record<
  string,
  {
    grad: string;
    desc: string;
    color: string;
    icon: string;
  }
> = {
  "AI Voice Receptionist": {
    grad: "linear-gradient(135deg, #6ea8ff, #b79cff)",
    desc: "Answers and qualifies phone calls, then books them",
    color: "#6ea8ff",
    icon: "V",
  },
  "AI Inbox Manager": {
    grad: "linear-gradient(135deg, #7df5c8, #6ea8ff)",
    desc: "Triages inbound email and DMs and drafts replies",
    color: "#7df5c8",
    icon: "I",
  },
  "Multilingual Front Desk": {
    grad: "linear-gradient(135deg, #b79cff, #ff8fb1)",
    desc: "Serves visitors in English, Cantonese, and Mandarin",
    color: "#b79cff",
    icon: "M",
  },
  "Quote & Proposal Builder": {
    grad: "linear-gradient(135deg, #ffd166, #ff8fb1)",
    desc: "Turns a conversation into a tailored quote",
    color: "#ffd166",
    icon: "Q",
  },
  "Reactivation Engine": {
    grad: "linear-gradient(135deg, #7df5c8, #ffd166)",
    desc: "Re-engages dormant leads on its own",
    color: "#7df5c8",
    icon: "R",
  },
  "Market & Competitor Watch": {
    grad: "linear-gradient(135deg, #6ea8ff, #ffd166)",
    desc: "Monitors signals and sends short summaries",
    color: "#ffd166",
    icon: "W",
  },
};

// Build a 24-point sparkline series using deterministic telemetry
function buildSeries(seed: number, t: number, base: number, amp: number): number[] {
  return Array.from({ length: 24 }, (_, i) => {
    const pt = (t - 24 + i + 0.5);
    return Math.max(0, wobble(seed * 7 + i * 0.3, pt * 0.4, base, amp));
  });
}

// Flat muted line for inactive modules
const FLAT_SERIES = Array.from({ length: 24 }, (_, i) => 4 + (i % 3 === 0 ? 1 : 0));

interface ModuleStatsProps {
  name: string;
  t: number;
  seed: number;
}

function ModuleStats({ name, t, seed }: ModuleStatsProps) {
  if (name === "AI Voice Receptionist") {
    const calls = Math.floor(climb(t, 128, 0.22, seed, 0.8));
    const booked = Math.floor(climb(t, 34, 0.07, seed + 1, 0.3));
    const avgMin = wobble(seed + 2, t, 2.1, 0.4, 0.18).toFixed(1);
    return (
      <div className="md-stats-row">
        <div className="md-stat">
          <span className="md-stat-val">{calls.toLocaleString("en-US")}</span>
          <span className="md-stat-label">Calls</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{booked}</span>
          <span className="md-stat-label">Booked</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{avgMin}m</span>
          <span className="md-stat-label">Avg len</span>
        </div>
      </div>
    );
  }
  if (name === "AI Inbox Manager") {
    const triaged = Math.floor(climb(t, 1180, 1.1, seed, 3.5));
    const drafted = Math.floor(climb(t, 304, 0.28, seed + 1, 1.2));
    const pending = Math.floor(wobble(seed + 3, t, 14, 4, 0.22));
    return (
      <div className="md-stats-row">
        <div className="md-stat">
          <span className="md-stat-val">{triaged.toLocaleString("en-US")}</span>
          <span className="md-stat-label">Triaged</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{drafted}</span>
          <span className="md-stat-label">Drafted</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{Math.abs(pending)}</span>
          <span className="md-stat-label">Pending</span>
        </div>
      </div>
    );
  }
  if (name === "Multilingual Front Desk") {
    const sessions = Math.floor(climb(t, 518, 0.45, seed, 1.8));
    const langs = 3;
    const satisfaction = (gauge01(seed + 1, t, 0.91, 0.98) * 100).toFixed(0);
    return (
      <div className="md-stats-row">
        <div className="md-stat">
          <span className="md-stat-val">{sessions}</span>
          <span className="md-stat-label">Sessions</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{langs}</span>
          <span className="md-stat-label">Langs</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{satisfaction}%</span>
          <span className="md-stat-label">CSAT</span>
        </div>
      </div>
    );
  }
  if (name === "Quote & Proposal Builder") {
    return (
      <div className="md-stats-row md-stats-row-muted">
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">--</span>
          <span className="md-stat-label">Quotes</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">~28/mo</span>
          <span className="md-stat-label">Projected</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">--</span>
          <span className="md-stat-label">Sent</span>
        </div>
      </div>
    );
  }
  if (name === "Reactivation Engine") {
    const reengaged = Math.floor(climb(t, 71, 0.08, seed, 0.4));
    const replies = Math.floor(climb(t, 17, 0.02, seed + 1, 0.15));
    const rate = (gauge01(seed + 2, t, 0.22, 0.28, 0.14) * 100).toFixed(0);
    return (
      <div className="md-stats-row">
        <div className="md-stat">
          <span className="md-stat-val">{reengaged}</span>
          <span className="md-stat-label">Re-engaged</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{replies}</span>
          <span className="md-stat-label">Replies</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val">{rate}%</span>
          <span className="md-stat-label">Reply rate</span>
        </div>
      </div>
    );
  }
  if (name === "Market & Competitor Watch") {
    return (
      <div className="md-stats-row md-stats-row-muted">
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">--</span>
          <span className="md-stat-label">Signals</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">~6/wk</span>
          <span className="md-stat-label">Projected</span>
        </div>
        <div className="md-stat-sep" />
        <div className="md-stat">
          <span className="md-stat-val md-stat-val-muted">--</span>
          <span className="md-stat-label">Alerts</span>
        </div>
      </div>
    );
  }
  return null;
}

// Sub-label for the activity mini-bar
function activityLabel(name: string, t: number, seed: number): string {
  if (name === "AI Voice Receptionist") {
    const rps = wobble(seed, t, 2.4, 0.8, 0.3).toFixed(1);
    return `${rps} calls/hr`;
  }
  if (name === "AI Inbox Manager") {
    const rps = wobble(seed, t, 6.2, 1.4, 0.25).toFixed(1);
    return `${rps} msgs/hr`;
  }
  if (name === "Multilingual Front Desk") {
    const rps = wobble(seed, t, 1.8, 0.5, 0.2).toFixed(1);
    return `${rps} sessions/hr`;
  }
  if (name === "Reactivation Engine") {
    const rps = wobble(seed, t, 0.6, 0.2, 0.18).toFixed(1);
    return `${rps} contacts/hr`;
  }
  return "";
}

// Build sparkline for a card
function cardSeries(name: string, t: number, seed: number, on: boolean): number[] {
  if (!on) return FLAT_SERIES;
  if (name === "AI Voice Receptionist") return buildSeries(seed, t, 18, 9);
  if (name === "AI Inbox Manager") return buildSeries(seed, t, 42, 18);
  if (name === "Multilingual Front Desk") return buildSeries(seed, t, 12, 5);
  if (name === "Reactivation Engine") return buildSeries(seed, t, 6, 3);
  return FLAT_SERIES;
}

export function Modules() {
  const { state } = useTimeline();
  const t = state.t;

  // Top-strip live numbers
  const actionsToday = Math.floor(climb(t, 284, 0.72, 11, 2.1));
  const automationsRun = Math.floor(climb(t, 1840, 4.4, 17, 8.5));
  const coveragePct = (gauge01(3, t, 0.89, 0.94, 0.08) * 100).toFixed(0);

  return (
    <div className="os-modules">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Agents</h2>
          <p className="os-screen-sub">Switch on new AI agents as you grow</p>
        </div>
        <div className="os-status-pill os-status-pill-violet">
          <span className="os-status-dot os-status-dot-violet" />
          4 of 6 active
        </div>
      </header>

      {/* Top metrics strip */}
      <div className="md-strip">
        <div className="md-tile">
          <span className="md-tile-label">Active modules</span>
          <span className="md-tile-val">4<span className="md-tile-denom">/6</span></span>
        </div>
        <div className="md-tile">
          <span className="md-tile-label">Actions today</span>
          <span className="md-tile-val">{actionsToday.toLocaleString("en-US")}</span>
        </div>
        <div className="md-tile">
          <span className="md-tile-label">Automations run</span>
          <span className="md-tile-val">{automationsRun.toLocaleString("en-US")}</span>
        </div>
        <div className="md-tile">
          <span className="md-tile-label">Time saved</span>
          <span className="md-tile-val">38<span className="md-tile-unit">h/wk</span></span>
        </div>
        <div className="md-tile">
          <span className="md-tile-label">Coverage</span>
          <span className="md-tile-val">{coveragePct}<span className="md-tile-unit">%</span></span>
        </div>
      </div>

      {/* 3x2 module grid */}
      <div className="os-modules-grid">
        {EXPANSION.map((mod, i) => {
          const meta = CARD_META[mod.name] ?? {
            grad: "linear-gradient(135deg, #6ea8ff, #b79cff)",
            desc: "",
            color: "#6ea8ff",
            icon: "?",
          };
          const seed = i + 1;
          const series = cardSeries(mod.name, t, seed, mod.on);
          const actLabel = mod.on ? activityLabel(mod.name, t, seed) : "";

          return (
            <motion.div
              key={mod.name}
              className={`os-module-card md-card${mod.on ? " os-module-card-on" : " os-module-card-off"}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Card header: icon + name + desc */}
              <div className="md-card-head">
                <div
                  className="os-module-icon"
                  style={{ background: meta.grad }}
                />
                <div className="md-card-title-block">
                  <span className="os-module-name">{mod.name}</span>
                  <span className="os-module-desc">{meta.desc}</span>
                </div>
              </div>

              {/* Live stats row */}
              <ModuleStats name={mod.name} t={t} seed={seed} />

              {/* Sparkline area */}
              <div className="md-spark-area">
                <div className="md-spark-header">
                  <span className="md-spark-label">Activity 24h</span>
                  {mod.on && actLabel && (
                    <span className="md-spark-rate" style={{ color: meta.color }}>{actLabel}</span>
                  )}
                </div>
                {mod.on ? (
                  <Sparkline
                    points={series}
                    color={meta.color}
                    w={320}
                    h={38}
                  />
                ) : (
                  <div className="md-spark-inactive">
                    <Sparkline
                      points={FLAT_SERIES}
                      color="rgba(255,255,255,0.12)"
                      w={320}
                      h={38}
                    />
                    <span className="md-spark-inactive-label">Switch on to activate</span>
                  </div>
                )}
              </div>

              {/* Footer: toggle + last-active */}
              <div className="md-card-foot">
                <div className={`os-module-toggle${mod.on ? " os-module-toggle-on" : " os-module-toggle-off"}`}>
                  <span className="os-module-toggle-knob" />
                  <span className="os-module-toggle-label">
                    {mod.on ? "On" : "Off"}
                  </span>
                </div>
                {mod.on ? (
                  <span className="md-foot-last">last active 1m ago</span>
                ) : (
                  <span className="md-foot-last md-foot-last-off">not running</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
