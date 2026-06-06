"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { ramp } from "@/lib/os-demo/timeline";
import { CREATIVES } from "@/lib/os-demo/fixtures";
import { Panel } from "@/components/os/ui/frame";
import { Sparkline } from "@/components/os/ui/sparkline";

const EASE = [0.16, 1, 0.3, 1] as const;
const BAR_MAX = 70;

const MINT = "#7df5c8";
const COOL = "#6f7aa8";

const smooth = (x: number) => x * x * (3 - 2 * x);

// Deterministic rising ROAS series from ~2.9 up to the current blended value.
function roasSeries(current: number) {
  const start = 2.9;
  return Array.from({ length: 14 }, (_, i) =>
    start + (current - start) * smooth(i / 13),
  );
}

export function AdEngine() {
  const { state } = useTimeline();

  // Marquee reallocation ramp: bars interpolate spendStart -> spendEnd over 8s from t=50.
  const shift = ramp(state.t, 50, 8);

  // Top stat tiles, all driven by loop progress for confident motion.
  const blendedRoas = 3.1 + (3.6 - 3.1) * state.progress;
  const costPerLead = Math.round(84 + (71 - 84) * state.progress);

  const moved = state.has("budget-shift");
  const winner = CREATIVES.find((c) => c.winner);

  return (
    <div className="os-ade">
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

      <div className="os-ade-stats">
        <div className="os-ade-stat">
          <span className="os-ade-stat-val">HK$100</span>
          <span className="os-ade-stat-label">Daily spend</span>
        </div>
        <div className="os-ade-stat">
          <span className="os-ade-stat-val os-ade-stat-mint">{blendedRoas.toFixed(1)}x</span>
          <span className="os-ade-stat-label">Blended ROAS</span>
        </div>
        <div className="os-ade-stat">
          <span className="os-ade-stat-val">HK${costPerLead}</span>
          <span className="os-ade-stat-label">Cost per lead</span>
        </div>
      </div>

      <div className="os-ade-grid">
        <Panel title="Budget allocation" tag="AUTO" className="os-ade-alloc-panel">
          <AnimatePresence>
            {moved && (
              <motion.div
                key="callout"
                className="os-ade-callout"
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="os-ade-callout-glyph" />
                <div className="os-ade-callout-copy">
                  <strong>Budget moved to top creative: {winner?.name}</strong>
                  <span>The Ad Engine shifted spend toward the highest ROAS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="os-ade-alloc-list">
            {CREATIVES.map((c) => {
              const spend = c.spendStart + (c.spendEnd - c.spendStart) * shift;
              const pct = Math.min(100, (spend / BAR_MAX) * 100);
              const color = c.winner ? MINT : COOL;
              return (
                <div className="os-ade-alloc" key={c.id}>
                  <div className="os-ade-alloc-top">
                    <span className="os-ade-alloc-name">
                      {c.name}
                      {c.winner && <span className="os-ade-top-badge">TOP</span>}
                    </span>
                    <span className="os-ade-alloc-roas">{c.roas}x ROAS</span>
                  </div>
                  <div className="os-ade-alloc-bar">
                    <div className="os-ade-alloc-track">
                      <div
                        className="os-ade-alloc-fill"
                        style={{
                          width: `${pct}%`,
                          background: color,
                          boxShadow: `0 0 14px ${color}66`,
                        }}
                      />
                    </div>
                    <span
                      className="os-ade-alloc-val"
                      style={c.winner ? { color: MINT } : undefined}
                    >
                      HK${Math.round(spend)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Performance" className="os-ade-perf-panel">
          <div className="os-ade-perf-roas">
            <span className="os-ade-perf-num">{blendedRoas.toFixed(1)}x</span>
            <span className="os-ade-perf-cap">Blended ROAS, trending up</span>
          </div>
          <div className="os-ade-perf-chart">
            <Sparkline
              points={roasSeries(blendedRoas)}
              color={MINT}
              w={360}
              h={120}
            />
          </div>
          <div className="os-ade-legend">
            {CREATIVES.map((c) => (
              <div
                className={`os-ade-leg${c.winner ? " is-winner" : ""}`}
                key={c.id}
              >
                <span
                  className="os-ade-leg-dot"
                  style={{
                    background: c.winner ? MINT : COOL,
                    boxShadow: `0 0 8px ${(c.winner ? MINT : COOL)}88`,
                  }}
                />
                <span className="os-ade-leg-name">{c.name}</span>
                <span className="os-ade-leg-roas">{c.roas}x</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
