"use client";

import * as Lucide from "lucide-react";
import { motion } from "motion/react";
import { useSim } from "@/lib/command/use-sim";
import { wobble } from "@/lib/command/seed";
import type { GraphNode } from "@/lib/command/types";
import "./team.css";

const ICONS = Lucide as unknown as Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number }>
>;
function Icon({ name, size = 18, strokeWidth = 1.6 }: { name: string; size?: number; strokeWidth?: number }) {
  const C = ICONS[name] ?? Lucide.Circle;
  return <C size={size} strokeWidth={strokeWidth} />;
}

export function Team() {
  const { nodes, links, domains, t } = useSim();
  const agents = nodes.filter((n) => n.kind === "agent");
  const domMap = Object.fromEntries(domains.map((d) => [d.id, d]));

  // Clients served per agent: links are { from: clientId, to: agentId }
  const servedCount: Record<string, number> = {};
  for (const l of links) {
    servedCount[l.to] = (servedCount[l.to] ?? 0) + 1;
  }

  const activeNow = agents.filter((a) => a.status !== "idle").length;
  const tasksInFlight = agents.reduce((s, a) => s + a.queue.length, 0);

  const rows = agents.map((a, i) => {
    const dom = domMap[a.domain];
    // workload derived from level + a live wobble so it breathes
    const base = 45 + (a.level % 50);
    const load = Math.round(Math.min(98, Math.max(12, wobble(i * 13 + 5, t, base, 14))));
    return { node: a, dom, load, served: servedCount[a.id] ?? 0 };
  });

  return (
    <div className="tm-root">
      <div className="tm-head">
        <div className="tm-head-l">
          <span className="tm-head-mark">
            <Lucide.Users size={22} strokeWidth={1.6} />
          </span>
          <div>
            <div className="tm-title">Team Roster</div>
            <div className="tm-sub">{agents.length} autonomous teammates</div>
          </div>
        </div>
        <div className="tm-summary">
          <div className="tm-sum-cell">
            <div className="tm-sum-k">Members</div>
            <div className="tm-sum-v">{agents.length}</div>
          </div>
          <div className="tm-sum-cell">
            <div className="tm-sum-k">Active now</div>
            <div className="tm-sum-v" data-tone="mint">
              {activeNow}
            </div>
          </div>
          <div className="tm-sum-cell">
            <div className="tm-sum-k">Tasks in flight</div>
            <div className="tm-sum-v" data-tone="blue">
              {tasksInFlight}
            </div>
          </div>
        </div>
      </div>

      <div className="tm-table">
        <div className="tm-thead">
          <span>Teammate</span>
          <span>Role</span>
          <span>Status</span>
          <span>Current task</span>
          <span>Workload</span>
          <span style={{ textAlign: "right" }}>Clients</span>
        </div>
        {rows.map(({ node, dom, load, served }, i) => (
          <TeamRow key={node.id} node={node} color={dom?.color ?? "#6ea8ff"} roleLabel={dom?.label ?? node.domain} load={load} served={served} idx={i} />
        ))}
      </div>
    </div>
  );
}

function TeamRow({
  node,
  color,
  roleLabel,
  load,
  served,
  idx,
}: {
  node: GraphNode;
  color: string;
  roleLabel: string;
  load: number;
  served: number;
  idx: number;
}) {
  const task = node.queue[0];
  return (
    <motion.div
      className="tm-row"
      style={{ ["--dc" as string]: color }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, delay: idx * 0.025 }}
    >
      <div className="tm-who">
        <span className="tm-ava">
          <Icon name={node.icon} size={18} />
        </span>
        <div className="tm-who-id">
          <div className="tm-who-name">{node.label}</div>
          <div className="tm-who-meta">
            LVL {node.level} / {node.xp}% XP
          </div>
        </div>
      </div>

      <div className="tm-role">
        <b>{roleLabel}</b> agent
      </div>

      <span className="tm-status" data-s={node.status}>
        <span className="tm-status-dot" />
        {node.status}
      </span>

      <div className={`tm-task${node.status === "idle" ? " tm-task-idle" : ""}`}>
        {node.status === "idle" ? "Standing by" : task}
      </div>

      <div className="tm-load">
        <div className="tm-load-bar">
          <div className="tm-load-fill" style={{ width: `${load}%` }} />
        </div>
        <span className="tm-load-pct">{load}% capacity</span>
      </div>

      <div className="tm-clients">
        <div className="tm-clients-v">{served}</div>
        <div className="tm-clients-k">served</div>
      </div>
    </motion.div>
  );
}
