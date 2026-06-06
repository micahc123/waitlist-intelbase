"use client";

import { useSim } from "@/lib/command/use-sim";

function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function fmtUptime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `+${pad(h)}:${pad(m)}:${pad(ss)}`;
}

export function Hud() {
  const { counters } = useSim();

  return (
    <div className="cmd-hud" role="group" aria-label="System telemetry">
      <div className="cmd-hud-cell cmd-hud-cell--mrr">
        <span className="cmd-hud-label">MRR</span>
        <span className="cmd-hud-val">HK${fmtNum(counters.mrr)}</span>
      </div>
      <div className="cmd-hud-cell cmd-hud-cell--leads">
        <span className="cmd-hud-label">Leads</span>
        <span className="cmd-hud-val">{fmtNum(counters.leads)}</span>
      </div>
      <div className="cmd-hud-cell cmd-hud-cell--tasks">
        <span className="cmd-hud-label">Tasks</span>
        <span className="cmd-hud-val">{fmtNum(counters.tasks)}</span>
      </div>
      <div className="cmd-hud-cell cmd-hud-cell--uptime">
        <span className="cmd-hud-label">Uptime</span>
        <span className="cmd-hud-val">{fmtUptime(counters.uptimeSec)}</span>
      </div>
    </div>
  );
}
