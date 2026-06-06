"use client";

import { useTimeline } from "@/lib/os-demo/use-timeline";
import { wobble, gauge01 } from "@/lib/os-demo/telemetry";
import type { ScreenId } from "@/lib/os-demo/types";
import { SCREENS } from "./screens/registry";

interface Props {
  active: ScreenId;
  onSelect: (id: ScreenId) => void;
}

// Live sub-stat shown on the right of each nav row.
function navSub(id: ScreenId, t: number): string {
  switch (id) {
    case "overview":
      return "live";
    case "concierge":
      return `${Math.max(1, Math.floor(wobble(7, t, 3, 1.4, 0.5)))} active`;
    case "pipeline":
      return "6 leads";
    case "nurture":
      return String(Math.floor(wobble(15, t, 233, 4, 0.3)));
    case "ad-engine":
      return `${(wobble(19, t, 3.5, 0.2, 0.6)).toFixed(1)}x`;
    case "modules":
      return "4/6";
    default:
      return "";
  }
}

const AGENTS: { name: string; color: string; seed: number }[] = [
  { name: "Concierge", color: "#6ea8ff", seed: 61 },
  { name: "Lead Gen", color: "#7df5c8", seed: 67 },
  { name: "Nurture", color: "#ffd166", seed: 71 },
  { name: "Ad Engine", color: "#ff8fb1", seed: 73 },
  { name: "Control", color: "#b79cff", seed: 79 },
];

function Gauge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="os-side-gauge">
      <div className="os-side-gauge-head">
        <span className="os-side-gauge-label">{label}</span>
        <span className="os-side-gauge-val">{pct}%</span>
      </div>
      <div className="os-side-gauge-track">
        <div className="os-side-gauge-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Sidebar({ active, onSelect }: Props) {
  const { t } = useTimeline();

  const cpu = gauge01(2, t, 0.28, 0.74, 0.5);
  const mem = gauge01(5, t, 0.4, 0.68, 0.3);
  const queue = gauge01(9, t, 0.15, 0.55, 0.8);

  return (
    <aside className="os-sidebar">
      <div className="os-side-brand">
        <div className="os-wordmark">intelbase OS</div>
        <div className="os-side-build">v2.4.1  build 8f3a2</div>
      </div>

      <nav className="os-side-nav">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`os-side-nav-item${s.id === active ? " is-active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="os-side-nav-label">{s.label}</span>
            <span className="os-side-nav-sub">{navSub(s.id, t)}</span>
          </button>
        ))}
      </nav>

      <div className="os-side-section">
        <div className="os-side-head">System</div>
        <div className="os-side-gauges">
          <Gauge label="CPU" value={cpu} />
          <Gauge label="Memory" value={mem} />
          <Gauge label="Queue" value={queue} />
        </div>
      </div>

      <div className="os-side-section">
        <div className="os-side-head">Runtime</div>
        <div className="os-side-agents">
          {AGENTS.map((a) => {
            const req = Math.max(0, Math.floor(wobble(a.seed, t, 120, 40, 0.7)));
            return (
              <div className="os-side-agent" key={a.name}>
                <span
                  className="os-side-agent-dot"
                  style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }}
                />
                <span className="os-side-agent-name">{a.name}</span>
                <span className="os-side-agent-req">{req}</span>
                <span className="os-side-agent-ok">ok</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
