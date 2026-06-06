"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { STORY } from "@/lib/os-demo/timeline";
import { AGENTS, KPIS } from "@/lib/os-demo/fixtures";
import { Panel, Dot } from "@/components/os/ui/frame";
import { Kpi } from "@/components/os/ui/kpi";
import { Feed } from "@/components/os/ui/feed";

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

export function Overview() {
  const { state } = useTimeline();

  const lines = STORY.filter((e) => state.has(e.id) && e.feed)
    .map((e) => ({ id: e.id, text: e.feed! }))
    .reverse();

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
    </div>
  );
}
