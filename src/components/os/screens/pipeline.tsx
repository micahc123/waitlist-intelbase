"use client";

import "./pipeline.css";
import { motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { wobble, climb } from "@/lib/os-demo/telemetry";
import { LEADS, type Lead } from "@/lib/os-demo/fixtures";
import { Sparkline } from "@/components/os/ui/sparkline";

const EASE = [0.16, 1, 0.3, 1] as const;

type Stage = Lead["stage"];

const COLUMNS: {
  stage: Stage;
  label: string;
  accent: string;
  sparkSeeds: number[];
}[] = [
  { stage: "new",       label: "New",       accent: "#9aa3c4", sparkSeeds: [1,2,3,4,5,6,7] },
  { stage: "qualified", label: "Qualified",  accent: "#6ea8ff", sparkSeeds: [8,9,10,11,12,13,14] },
  { stage: "booked",    label: "Booked",     accent: "#7df5c8", sparkSeeds: [15,16,17,18,19,20,21] },
  { stage: "won",       label: "Won",        accent: "#b79cff", sparkSeeds: [22,23,24,25,26,27,28] },
];

// Extra demo leads -- deterministic, varied HK business names.
const EXTRA_LEADS: Lead[] = [
  { id: "x1",  name: "Pacific Optical",      value: "HK$17k", stage: "new" },
  { id: "x2",  name: "Kennedy Town Gym",     value: "HK$12k", stage: "new" },
  { id: "x3",  name: "Sheung Wan Acupuncture", value: "HK$8k", stage: "new" },
  { id: "x4",  name: "Lai Chi Kok Tutors",   value: "HK$14k", stage: "new" },
  { id: "x5",  name: "Tai Po Pet Clinic",    value: "HK$19k", stage: "qualified" },
  { id: "x6",  name: "Happy Valley Yoga",    value: "HK$11k", stage: "qualified" },
  { id: "x7",  name: "North Point Finance",  value: "HK$55k", stage: "qualified" },
  { id: "x8",  name: "Causeway Bay Clinic",  value: "HK$33k", stage: "booked" },
  { id: "x9",  name: "Wan Chai Architects",  value: "HK$80k", stage: "booked" },
  { id: "x10", name: "Mid-Levels Pilates",   value: "HK$16k", stage: "booked" },
  { id: "x11", name: "Tuen Mun Bakery",      value: "HK$7k",  stage: "won" },
  { id: "x12", name: "Stanley Insurance",    value: "HK$44k", stage: "won" },
  { id: "x13", name: "Repulse Bay Resort",   value: "HK$92k", stage: "won" },
  { id: "x14", name: "Aberdeen Seafood Co",  value: "HK$28k", stage: "won" },
];

// Merge fixture leads + extra leads.
const ALL_LEADS: Lead[] = [...LEADS, ...EXTRA_LEADS];

// Source chips, score pills, age labels -- deterministic by lead id hash.
const SOURCES = ["Web", "Ads", "WhatsApp", "Referral"] as const;
type Source = typeof SOURCES[number];

// Simple deterministic index from a string id.
function idNum(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) & 0xffff;
  return n;
}

function leadSource(id: string): Source {
  return SOURCES[idNum(id) % SOURCES.length];
}

function leadScore(id: string): number {
  // 0.60 to 0.96, deterministic
  const base = 0.60 + (idNum(id) % 37) / 100;
  return Math.round(base * 100) / 100;
}

function leadAge(id: string): string {
  const hours = [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36];
  const h = hours[idNum(id) % hours.length];
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

function parseHKD(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) * 1000;
}

function fmtHKD(n: number): string {
  if (n >= 1_000_000) return `HK$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `HK$${Math.round(n / 1_000)}k`;
  return `HK$${n}`;
}

// The hero lead (Harbour Dental) advances by the clock.
function heroStage(t: number): Stage {
  if (t < 20) return "new";
  if (t < 35) return "qualified";
  return "booked";
}

function effectiveStage(lead: Lead, t: number): Stage {
  return lead.hero ? heroStage(t) : lead.stage;
}

// Build 7 wobbled sparkline points for a column (deterministic per seeds + t).
function colSparkPoints(seeds: number[], t: number, base: number): number[] {
  return seeds.map((s) => wobble(s, t, base, base * 0.12, 0.5 + s * 0.07));
}

// Score pill CSS class.
function scoreClass(score: number): string {
  if (score >= 0.82) return "pl-score pl-score-hi";
  if (score >= 0.70) return "pl-score pl-score-mid";
  return "pl-score pl-score-lo";
}

export function Pipeline() {
  const { state } = useTimeline();
  const t = state.t;

  const heroGlow = (t >= 20 && t < 21.2) || (t >= 35 && t < 36.2);

  // Compute per-column cards from ALL_LEADS.
  const colCards: Record<Stage, Lead[]> = {
    new: [],
    qualified: [],
    booked: [],
    won: [],
  };
  for (const lead of ALL_LEADS) {
    colCards[effectiveStage(lead, t)].push(lead);
  }

  // Totals per column for column headers.
  const colTotal = (stage: Stage): number =>
    colCards[stage].reduce((sum, l) => sum + parseHKD(l.value), 0);

  // Total pipeline value (wobbled for live feel).
  const totalPipeline = wobble(1, t, 2_400_000, 40_000, 0.3);
  const velocity = wobble(3, t, 180_000, 8_000, 0.4);
  const dealsMonth = Math.floor(climb(t, 18, 0.02, 5, 0.5));

  // Grand totals per stage for funnel.
  const stageCounts: Record<Stage, number> = {
    new: colCards.new.length,
    qualified: colCards.qualified.length,
    booked: colCards.booked.length,
    won: colCards.won.length,
  };

  // Funnel conversion percentages (relative to New).
  const total = stageCounts.new || 1;
  function funnelPct(stage: Stage): string {
    return `${Math.round((stageCounts[stage] / total) * 100)}%`;
  }

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

      {/* Live metrics strip */}
      <div className="pl-metrics">
        <div className="pl-metric">
          <span className="pl-metric-label">Pipeline value</span>
          <span className="pl-metric-val">
            {totalPipeline >= 1_000_000
              ? `HK$${(totalPipeline / 1_000_000).toFixed(1)}M`
              : fmtHKD(totalPipeline)}
          </span>
          <span className="pl-metric-sub">across all stages</span>
        </div>
        <div className="pl-metric">
          <span className="pl-metric-label">Win rate</span>
          <span className="pl-metric-val">34%</span>
          <span className="pl-metric-sub">last 30 days</span>
        </div>
        <div className="pl-metric">
          <span className="pl-metric-label">Avg cycle</span>
          <span className="pl-metric-val pl-metric-val-sm">9d</span>
          <span className="pl-metric-sub">new to won</span>
        </div>
        <div className="pl-metric">
          <span className="pl-metric-label">Velocity</span>
          <span className="pl-metric-val pl-metric-val-sm">
            {fmtHKD(Math.round(velocity / 1000) * 1000)}/wk
          </span>
          <span className="pl-metric-sub">weighted avg</span>
        </div>
        <div className="pl-metric">
          <span className="pl-metric-label">Deals this month</span>
          <span className="pl-metric-val">{dealsMonth}</span>
          <span className="pl-metric-sub">won + booked</span>
        </div>
      </div>

      {/* Funnel mini-bar */}
      <div className="pl-funnel">
        {COLUMNS.map((col, i) => (
          <div key={col.stage} className="pl-funnel-seg">
            <div
              className="pl-funnel-accent"
              style={{ background: col.accent }}
            />
            <span className="pl-funnel-stage">{col.label}</span>
            <span className="pl-funnel-count">{stageCounts[col.stage]}</span>
            <span className="pl-funnel-pct">
              {i === 0 ? "100%" : funnelPct(col.stage)} conv.
            </span>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="os-pipe-grid">
        {COLUMNS.map((col) => {
          const cards = colCards[col.stage];
          const total = colTotal(col.stage);
          const sparkPts = colSparkPoints(col.sparkSeeds, t, cards.length + 1);

          return (
            <section key={col.stage} className="os-pipe-col">
              <div
                className="os-pipe-col-line"
                style={{
                  background: col.accent,
                  boxShadow: `0 0 12px ${col.accent}`,
                }}
              />
              <header className="os-pipe-col-head">
                <span className="os-pipe-col-name">{col.label}</span>
                <span className="os-pipe-count">{cards.length}</span>
              </header>
              <div className="pl-col-sub">
                <span className="pl-col-total">{fmtHKD(total)}</span>
                <span className="pl-col-spark">
                  <Sparkline
                    points={sparkPts}
                    color={col.accent}
                    w={60}
                    h={20}
                  />
                </span>
              </div>
              <div className="os-pipe-cards">
                {cards.map((lead) => {
                  const src = leadSource(lead.id);
                  const score = leadScore(lead.id);
                  const age = leadAge(lead.id);
                  return (
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
                      <div className="pl-card-meta">
                        <span className="pl-source">{src}</span>
                        <span className={scoreClass(score)}>
                          {score.toFixed(2)}
                        </span>
                        <span className="pl-age">{age}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
