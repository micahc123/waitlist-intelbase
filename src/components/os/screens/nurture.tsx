"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { SEQUENCES } from "@/lib/os-demo/fixtures";

const EASE = [0.16, 1, 0.3, 1] as const;
const BAR_MAX = 140;

// Distinct tint per sequence so the list reads as three confident tracks.
const SEQ_COLORS = ["#6ea8ff", "#7df5c8", "#ffd166"] as const;

const CONTACTS = SEQUENCES.reduce((sum, s) => sum + s.active, 0); // 233
const AVG_STEPS = Math.round(
  SEQUENCES.reduce((sum, s) => sum + s.steps, 0) / SEQUENCES.length,
); // 4

// Deterministic baseline activity feed (no em dashes).
const ACTIVITY = [
  { text: "Opened: Welcome step 2", color: "#6ea8ff" },
  { text: "Replied: Reactivation step 3", color: "#7df5c8" },
  { text: "Clicked booking link", color: "#ffd166" },
  { text: "Opened: Post-call step 1", color: "#6ea8ff" },
  { text: "Sent: Welcome step 4", color: "#9aa3c4" },
];

export function Nurture() {
  const { state } = useTimeline();

  // Replies this week climb slightly across the loop (34 -> 37).
  const repliesWeek = Math.floor(34 + 3 * state.progress);
  const reactivated = state.has("reactivation");

  return (
    <div className="os-nurture">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Nurture</h2>
          <p className="os-screen-sub">Following up with every lead on its own</p>
        </div>
        <div className="os-status-pill os-status-pill-amber">
          <span className="os-status-dot os-status-dot-amber" />
          3 sequences running
        </div>
      </header>

      <div className="os-nu-stats">
        <div className="os-nu-stat">
          <span className="os-nu-stat-val">{CONTACTS}</span>
          <span className="os-nu-stat-label">Contacts in nurture</span>
        </div>
        <div className="os-nu-stat">
          <span className="os-nu-stat-val os-nu-stat-mint">{repliesWeek}</span>
          <span className="os-nu-stat-label">Replies this week</span>
        </div>
        <div className="os-nu-stat">
          <span className="os-nu-stat-val">{AVG_STEPS}</span>
          <span className="os-nu-stat-label">Avg steps</span>
        </div>
      </div>

      <div className="os-nu-grid">
        <section className="os-panel os-nu-seq-panel">
          <header className="os-panel-head">
            <h3>Active sequences</h3>
          </header>
          <div className="os-nu-seq-list">
            {SEQUENCES.map((seq, i) => {
              const color = SEQ_COLORS[i];
              const pct = Math.min(100, (seq.active / BAR_MAX) * 100);
              return (
                <div className="os-nu-seq" key={seq.id}>
                  <div className="os-nu-seq-top">
                    <span className="os-nu-seq-name">{seq.name}</span>
                    <span className="os-nu-seq-meta">{seq.steps} steps</span>
                  </div>
                  <div className="os-nu-seq-track">
                    <div
                      className="os-nu-seq-fill"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        boxShadow: `0 0 14px ${color}66`,
                      }}
                    />
                  </div>
                  <div className="os-nu-seq-figs">
                    <span style={{ color }}>{seq.active} active</span>
                    <span className="os-nu-seq-sep">-</span>
                    <span className="os-nu-seq-replies">{seq.replies} replies</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="os-panel os-nu-feed-panel">
          <header className="os-panel-head">
            <h3>Recent activity</h3>
            <span className="os-tag">LIVE</span>
          </header>
          <div className="os-nu-feed">
            <AnimatePresence>
              {reactivated && (
                <motion.div
                  key="reactivated"
                  className="os-nu-react"
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span className="os-nu-react-glyph" />
                  <div className="os-nu-react-copy">
                    <strong>Reactivated: a dormant lead just replied</strong>
                    <span>Reactivation 90d sequence brought them back</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {ACTIVITY.map((row) => (
              <div className="os-nu-event" key={row.text}>
                <span
                  className="os-nu-event-dot"
                  style={{ background: row.color, boxShadow: `0 0 6px ${row.color}` }}
                />
                <span className="os-nu-event-text">{row.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
