"use client";

import { useTimeline } from "@/lib/os-demo/use-timeline";
import { wobble, commas } from "@/lib/os-demo/telemetry";

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="os-tb-chip">
      <span className="os-tb-chip-label">{label}</span>
      <span className="os-tb-chip-val">{value}</span>
    </div>
  );
}

export function TopBar() {
  const { t } = useTimeline();

  const reqMin = Math.floor(wobble(11, t, 1240, 80, 0.6));
  const sessions = Math.floor(wobble(23, t, 47, 6, 0.4));
  const queue = Math.max(0, Math.floor(wobble(37, t, 12, 5, 0.9)));
  const p95 = Math.floor(wobble(41, t, 116, 14, 0.7));
  const tokens = Math.floor(wobble(53, t, 8600, 900, 0.5));

  return (
    <header className="os-topbar">
      <div className="os-tb-left">
        <span className="os-tb-cluster">intelbase-os</span>
        <span className="os-tb-env">prod</span>
        <span className="os-tb-region">ap-east-1</span>
        <span className="os-tb-health">
          <span className="os-tb-health-dot" />
          All systems operational
        </span>
      </div>

      <div className="os-tb-right">
        <Chip label="Req/min" value={commas(reqMin)} />
        <Chip label="Sessions" value={String(sessions)} />
        <Chip label="Queue" value={String(queue)} />
        <Chip label="p95" value={`${p95}ms`} />
        <Chip label="Tokens/s" value={commas(tokens)} />
        <Chip label="Err" value="0.02%" />
        <Chip label="Uptime" value="99.98%" />
      </div>
    </header>
  );
}
