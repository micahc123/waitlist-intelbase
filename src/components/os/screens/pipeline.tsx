"use client";

import { motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { LEADS, type Lead } from "@/lib/os-demo/fixtures";

const EASE = [0.16, 1, 0.3, 1] as const;

type Stage = Lead["stage"];

const COLUMNS: { stage: Stage; label: string; accent: string }[] = [
  { stage: "new", label: "New", accent: "#9aa3c4" },
  { stage: "qualified", label: "Qualified", accent: "#6ea8ff" },
  { stage: "booked", label: "Booked", accent: "#7df5c8" },
  { stage: "won", label: "Won", accent: "#b79cff" },
];

// The hero lead (Harbour Dental) is driven by the clock, overriding its
// fixture stage so it auto-advances New -> Qualified -> Booked on cue.
function heroStage(t: number): Stage {
  if (t < 20) return "new";
  if (t < 35) return "qualified";
  return "booked";
}

// Effective stage: clock-driven for the hero, fixture-driven for everyone else.
function effectiveStage(lead: Lead, t: number): Stage {
  return lead.hero ? heroStage(t) : lead.stage;
}

export function Pipeline() {
  const { state } = useTimeline();
  const t = state.t;

  // A move just happened if we are within ~1.2s after either advance cue.
  const heroGlow = (t >= 20 && t < 21.2) || (t >= 35 && t < 36.2);

  return (
    <div className="os-pipeline">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Pipeline</h2>
          <p className="os-screen-sub">Leads moving themselves through the funnel</p>
        </div>
        <div className="os-status-pill">
          <span className="os-status-dot" />
          Auto-managed
        </div>
      </header>

      <div className="os-pipe-grid">
        {COLUMNS.map((col) => {
          const cards = LEADS.filter(
            (lead) => effectiveStage(lead, t) === col.stage,
          );
          return (
            <section key={col.stage} className="os-pipe-col">
              <div
                className="os-pipe-col-line"
                style={{ background: col.accent, boxShadow: `0 0 12px ${col.accent}` }}
              />
              <header className="os-pipe-col-head">
                <span className="os-pipe-col-name">{col.label}</span>
                <span className="os-pipe-count">{cards.length}</span>
              </header>
              <div className="os-pipe-cards">
                {cards.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={lead.id}
                    layout
                    transition={{ duration: 0.7, ease: EASE }}
                    className={`os-pipe-card${
                      lead.hero && heroGlow ? " is-moving" : ""
                    }${lead.hero ? " is-hero" : ""}`}
                  >
                    <span className="os-pipe-card-name">{lead.name}</span>
                    <span className="os-pipe-card-value">{lead.value}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
