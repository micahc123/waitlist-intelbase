"use client";

import * as Lucide from "lucide-react";
import { useSim } from "@/lib/command/use-sim";
import { wobble, seededRand } from "@/lib/command/seed";
import "./usage.css";

const ICONS = Lucide as unknown as Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number }>
>;
function Icon({ name, size = 14, strokeWidth = 1.7 }: { name: string; size?: number; strokeWidth?: number }) {
  const C = ICONS[name] ?? Lucide.Circle;
  return <C size={size} strokeWidth={strokeWidth} />;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return Math.round(n).toString();
}

export function Usage() {
  const { domains, nodes, counters, t } = useSim();

  // ---- Big 24h area chart (deterministic, breathing) ----
  const W = 1080;
  const H = 230;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 14;
  const PAD_B = 18;
  const N = 48; // 30-min buckets over 24h
  const series: number[] = [];
  for (let i = 0; i < N; i++) {
    // diurnal shape: low at night (ends), peak mid-day
    const day = Math.sin((i / (N - 1)) * Math.PI) ** 1.4;
    const v = 0.18 + day * 0.74 + wobble(i * 7 + 3, t, 0, 0.05, 0.4) + (seededRand(i * 11) - 0.5) * 0.06;
    series.push(Math.max(0.04, v));
  }
  const max = Math.max(...series);
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const pts = series.map((v, i) => {
    const x = PAD_L + (i / (N - 1)) * innerW;
    const y = PAD_T + (1 - v / max) * innerH;
    return [x, y] as const;
  });
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${PAD_L},${H - PAD_B} ${line} ${(W - PAD_R)},${H - PAD_B}`;
  const gridY = [0.25, 0.5, 0.75, 1].map((g) => PAD_T + (1 - g) * innerH);

  // peak now value
  const nowReq = Math.round(wobble(99, t, 1240, 180, 0.5));

  // ---- stat tiles (live) ----
  const tokens = 18_400_000 + counters.tasks * 41 + Math.round(wobble(1, t, 0, 60000, 0.3));
  const requests = 1_280_000 + counters.tasks * 6 + Math.round(wobble(2, t, 0, 4000, 0.3));
  const latency = wobble(3, t, 248, 26, 0.6);
  const spend = 1240 + counters.tasks * 0.012 + wobble(4, t, 0, 18, 0.3);

  const tiles = [
    { k: "Tokens today", v: fmt(tokens), unit: "", d: "+8.4% vs 24h", color: "#b79cff", icon: "Sigma" },
    { k: "Requests", v: fmt(requests), unit: "", d: "+3.1% vs 24h", color: "#6ea8ff", icon: "ArrowLeftRight" },
    { k: "Avg latency", v: Math.round(latency).toString(), unit: "ms", d: "-12ms p50", color: "#7df5c8", icon: "Gauge" },
    { k: "Spend (24h)", v: "$" + fmt(spend), unit: "", d: "$0.0021 / req", color: "#ffb86b", icon: "DollarSign" },
  ];

  // ---- per-domain usage ----
  const domUsage = domains
    .map((d, i) => {
      const val = Math.round(wobble(i * 23 + 9, t, 58, 30, 0.25) + (i % 3) * 4);
      return { ...d, val: Math.max(8, Math.min(99, val)) };
    })
    .sort((a, b) => b.val - a.val);

  // ---- top consumers ----
  const domMap = Object.fromEntries(domains.map((d) => [d.id, d]));
  const consumers = [...nodes]
    .filter((n) => n.kind !== "core")
    .map((n, i) => ({ node: n, usage: n.level * 1000 + n.xp * 30 + Math.round(wobble(i * 5 + 1, t, 0, 400, 0.4)) }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 7);
  const maxCons = consumers[0]?.usage ?? 1;

  const xLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];

  return (
    <div className="us-root">
      <div className="us-head">
        <div className="us-head-l">
          <span className="us-head-mark">
            <Lucide.BarChart3 size={22} strokeWidth={1.6} />
          </span>
          <div>
            <div className="us-title">Usage Analytics</div>
            <div className="us-sub">Compute, tokens and spend</div>
          </div>
        </div>
        <span className="us-live">
          <span className="us-live-dot" />
          Live / last 24h
        </span>
      </div>

      <div className="us-tiles">
        {tiles.map((tile) => (
          <div className="us-tile" key={tile.k} style={{ ["--tc" as string]: tile.color }}>
            <div className="us-tile-k">
              <Icon name={tile.icon} size={13} />
              {tile.k}
            </div>
            <div className="us-tile-v">
              {tile.v}
              {tile.unit && <small>{tile.unit}</small>}
            </div>
            <div className="us-tile-d">{tile.d}</div>
          </div>
        ))}
      </div>

      <div className="us-chart-card">
        <div className="us-chart-head">
          <div className="us-chart-title">Compute usage (24h)</div>
          <div className="us-chart-now">{nowReq.toLocaleString()} req/min now</div>
        </div>
        <div className="us-chart">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="us-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b79cff" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#b79cff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {gridY.map((y, i) => (
              <line key={i} x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 5" />
            ))}
            <polygon points={area} fill="url(#us-area)" />
            <polyline points={line} fill="none" stroke="#b79cff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.2" fill="#b79cff" />
          </svg>
        </div>
        <div className="us-chart-x">
          {xLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="us-lower">
        <div className="us-panel">
          <div className="us-panel-title">
            Usage by domain
            <span>{domains.length} domains</span>
          </div>
          {domUsage.map((d) => (
            <div className="us-dbar" key={d.id} style={{ ["--dc" as string]: d.color }}>
              <span className="us-dbar-name">
                <span className="us-dbar-dot" />
                {d.label}
              </span>
              <span className="us-dbar-track">
                <span className="us-dbar-fill" style={{ width: `${d.val}%` }} />
              </span>
              <span className="us-dbar-val">{d.val}%</span>
            </div>
          ))}
        </div>

        <div className="us-panel">
          <div className="us-panel-title">
            Top consumers
            <span>by tokens</span>
          </div>
          {consumers.map(({ node, usage }) => {
            const dom = domMap[node.domain];
            const color = dom?.color ?? "#6ea8ff";
            return (
              <div className="us-cons" key={node.id} style={{ ["--dc" as string]: color }}>
                <span className="us-cons-ava">
                  <Icon name={node.icon} size={15} />
                </span>
                <div className="us-cons-id">
                  <div className="us-cons-name">{node.label}</div>
                  <div className="us-cons-bar">
                    <div className="us-cons-bar-fill" style={{ width: `${(usage / maxCons) * 100}%` }} />
                  </div>
                </div>
                <span className="us-cons-val">{fmt(usage)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
