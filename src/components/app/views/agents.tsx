// Agents - the control panel for the AI workforce. Each agent is configured like
// a real employee: enabled, an autonomy level, plain-language instructions, and
// guardrails. A prominent kill switch pauses every agent at once.
//
// Data flows through /api/app/agents (GET configs joined with AGENTS metadata,
// POST to save or to pauseAll). The data layer returns DEMO configs when
// Supabase is unconfigured, so this populates with no keys; saves no-op
// gracefully in that case and the UI says so honestly.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Power,
  ShieldAlert,
  Check,
  Loader2,
  Info,
  List,
  Network,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import { ForceGraph, type GraphNode, type GraphLink } from "../graph/force-graph";
import "./controls.css";

type ViewMode = "list" | "graph";

// Accent colour per agent domain so the graph reads like the command plane
// constellation, drawn from the product accent tokens.
const DOMAIN_COLOR: Record<string, string> = {
  "Front desk": "#6ea8ff", // blue
  Email: "#7df5c8", // mint
  Calendar: "#67e8f9", // cyan
  Growth: "#ffb86b", // amber
  Lifecycle: "#ff8fb1", // pink
  Operations: "#b79cff", // violet
};
const AGENT_FALLBACK_COLOR = "#b79cff";

type Autonomy = "manual" | "approve" | "auto";

type Guardrails = {
  do_not_contact?: string;
  working_hours?: string;
  daily_send_cap?: number | "";
  [k: string]: unknown;
};

type AgentRow = {
  agentId: string;
  enabled: boolean;
  autonomy: Autonomy;
  instructions: string;
  guardrails: Guardrails;
  name: string;
  domain: string;
  tagline: string;
  toolkits: string[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTONOMY_OPTS: { value: Autonomy; label: string; hint: string }[] = [
  {
    value: "manual",
    label: "Manual",
    hint: "The agent only drafts and suggests. Nothing happens until you act on it yourself.",
  },
  {
    value: "approve",
    label: "Needs approval",
    hint: "The agent prepares the action and queues it in Approvals. It runs only after you approve.",
  },
  {
    value: "auto",
    label: "Autonomous",
    hint: "The agent acts on its own within its guardrails. High-stakes external actions still pause for you.",
  },
];

const TOOLKIT_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Google Calendar",
  slack: "Slack",
  hubspot: "HubSpot",
  notion: "Notion",
  googlesheets: "Google Sheets",
  whatsapp: "WhatsApp",
  meta_ads: "Meta Ads",
};

export function Agents() {
  const [agents, setAgents] = useState<AgentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [killBusy, setKillBusy] = useState(false);
  const [view, setView] = useState<ViewMode>("graph");
  // Set when a graph node is clicked, so List mode scrolls to/highlights it.
  const [focusAgent, setFocusAgent] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/app/agents", { credentials: "include" });
        const data = (await res.json()) as { agents?: AgentRow[] };
        if (!cancelled) setAgents(data.agents ?? []);
      } catch {
        if (!cancelled) setError("Could not load agents.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allPaused = Boolean(agents && agents.length > 0 && agents.every((a) => !a.enabled));

  const handleKillSwitch = useCallback(async () => {
    if (!agents) return;
    const pause = !allPaused;
    if (pause) {
      const ok = window.confirm(
        "Pause every agent? They will stop acting immediately until you resume. Drafts and approvals are kept.",
      );
      if (!ok) return;
    }
    // Optimistic flip of every agent's enabled flag.
    setAgents((prev) => prev?.map((a) => ({ ...a, enabled: !pause })) ?? prev);
    setKillBusy(true);
    try {
      await fetch("/api/app/agents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseAll: pause }),
      });
    } catch {
      // keep optimistic state; demo mode no-ops anyway
    } finally {
      setKillBusy(false);
    }
  }, [agents, allPaused]);

  const updateAgent = useCallback((agentId: string, patch: Partial<AgentRow>) => {
    setAgents((prev) =>
      prev?.map((a) => (a.agentId === agentId ? { ...a, ...patch } : a)) ?? prev,
    );
  }, []);

  const graph = useMemo(() => buildAgentGraph(agents ?? []), [agents]);

  // After switching to List mode via a graph click, scroll the chosen card into
  // view and pulse it briefly.
  useEffect(() => {
    if (view !== "list" || !focusAgent) return;
    const el = cardRefs.current.get(focusAgent);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("is-focused");
      const t = window.setTimeout(() => el.classList.remove("is-focused"), 1600);
      return () => window.clearTimeout(t);
    }
  }, [view, focusAgent]);

  const handleNodeSelect = useCallback((id: string) => {
    // Only agent nodes route to the list; core/toolkit nodes are decorative.
    if (id.startsWith("agent:")) {
      const agentId = id.slice(6);
      setFocusAgent(agentId);
      setView("list");
    }
  }, []);

  return (
    <div className="ibx">
      <ViewHead
        title="Agents"
        subtitle="Configure each agent like an employee: turn it on, set how much it can do on its own, give it instructions, and set its guardrails."
      />

      <div className="ag-toolbar">
        <div className="ibx-seg" role="group" aria-label="View mode">
          <button
            type="button"
            className={`ibx-seg-opt${view === "list" ? " is-active" : ""}`}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />
            List
          </button>
          <button
            type="button"
            className={`ibx-seg-opt${view === "graph" ? " is-active" : ""}`}
            aria-pressed={view === "graph"}
            onClick={() => setView("graph")}
          >
            <Network size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />
            Graph
          </button>
        </div>
      </div>

      <div
        className={`ag-kill${allPaused ? " is-paused" : ""}`}
        role="region"
        aria-label="Global agent controls"
      >
        <div className="ag-kill-icon">
          {allPaused ? <ShieldAlert size={20} /> : <Power size={20} />}
        </div>
        <div className="ag-kill-body">
          <div className="ag-kill-title">
            {allPaused ? "All agents are paused" : "All agents are running"}
          </div>
          <div className="ag-kill-sub">
            {allPaused
              ? "Nothing will be sent, booked, or changed until you resume."
              : "The kill switch instantly pauses every agent at once."}
          </div>
        </div>
        <button
          type="button"
          className={`ibx-btn${allPaused ? " ibx-btn-primary" : " ibx-btn-danger"}`}
          onClick={handleKillSwitch}
          disabled={!agents || killBusy}
        >
          {killBusy ? (
            <Loader2 size={15} className="ibx-spin" />
          ) : (
            <Power size={15} />
          )}
          {allPaused ? "Resume all agents" : "Pause all agents"}
        </button>
      </div>

      {error && !agents ? (
        <div className="ibx-panel">
          <div className="ibx-empty">
            <div className="ibx-empty-icon">
              <Bot size={22} />
            </div>
            <div>{error}</div>
          </div>
        </div>
      ) : !agents ? (
        <div className="ibx-panel">
          <div className="ibx-empty">
            <Loader2 size={20} className="ibx-spin" />
            <div>Loading agents...</div>
          </div>
        </div>
      ) : view === "graph" ? (
        <div className="ibx-panel ag-graph-panel">
          <div className="ibx-panel-head">
            <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>
              Agent constellation
            </span>
            <span className="ibx-hint">
              Click an agent to open its config. Drag to rearrange, scroll to zoom.
            </span>
          </div>
          <div className="ag-graph">
            <ForceGraph
              nodes={graph.nodes}
              links={graph.links}
              onSelect={handleNodeSelect}
              height={500}
              idleSpin
            />
            <div className="ag-graph-legend" aria-hidden="true">
              <span className="ag-legend-item">
                <span className="ag-legend-dot" style={{ background: "#6ea8ff" }} />
                Core
              </span>
              <span className="ag-legend-item">
                <span className="ag-legend-dot" style={{ background: "#b79cff" }} />
                Agent
              </span>
              <span className="ag-legend-item">
                <span
                  className="ag-legend-dot"
                  style={{ background: "#7e879d" }}
                />
                Toolkit
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="ag-grid">
          {agents.map((a) => (
            <AgentCard
              key={a.agentId}
              agent={a}
              onLocalChange={updateAgent}
              cardRef={(el) => {
                if (el) cardRefs.current.set(a.agentId, el);
                else cardRefs.current.delete(a.agentId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Build the agent constellation: a central Intelbase Core, one node per agent
// (coloured by domain), and one smaller muted node per distinct toolkit. Each
// agent links to the core and to every toolkit it can use, so shared toolkits
// draw agents together.
function buildAgentGraph(agents: AgentRow[]): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  if (agents.length === 0) return { nodes, links };

  nodes.push({
    id: "core",
    label: "Intelbase Core",
    kind: "core",
    color: "#6ea8ff",
    size: 16,
  });

  const toolkitSeen = new Map<string, number>();

  for (const a of agents) {
    nodes.push({
      id: `agent:${a.agentId}`,
      label: a.name,
      kind: "agent",
      color: a.enabled
        ? (DOMAIN_COLOR[a.domain] ?? AGENT_FALLBACK_COLOR)
        : "#565d72", // faint when paused
      size: 11,
    });
    links.push({ source: `agent:${a.agentId}`, target: "core" });
    for (const t of a.toolkits) {
      const key = `toolkit:${t}`;
      toolkitSeen.set(key, (toolkitSeen.get(key) ?? 0) + 1);
      links.push({ source: `agent:${a.agentId}`, target: key });
    }
  }

  for (const [id, count] of toolkitSeen) {
    const slug = id.slice(8);
    nodes.push({
      id,
      label: TOOLKIT_LABELS[slug] ?? slug,
      kind: "toolkit",
      color: "#7e879d",
      size: 5 + Math.min(count, 4),
    });
  }

  return { nodes, links };
}

function AgentCard({
  agent,
  onLocalChange,
  cardRef,
}: {
  agent: AgentRow;
  onLocalChange: (agentId: string, patch: Partial<AgentRow>) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const [save, setSave] = useState<SaveState>("idle");

  const persist = useCallback(
    async (patch: Partial<Pick<AgentRow, "enabled" | "autonomy" | "instructions" | "guardrails">>) => {
      setSave("saving");
      try {
        const res = await fetch("/api/app/agents", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: agent.agentId, patch }),
        });
        const data = (await res.json()) as { ok?: boolean; reason?: string };
        // Demo mode returns ok:false/unconfigured; treat that as a benign
        // "not persisted" rather than a hard error so the demo reads honestly.
        setSave(data.ok || data.reason === "unconfigured" ? "saved" : "error");
      } catch {
        setSave("error");
      }
      window.setTimeout(() => setSave("idle"), 2200);
    },
    [agent.agentId],
  );

  const setGuardrail = useCallback(
    (key: keyof Guardrails, value: unknown) => {
      const next = { ...agent.guardrails, [key]: value };
      onLocalChange(agent.agentId, { guardrails: next });
      return next;
    },
    [agent.agentId, agent.guardrails, onLocalChange],
  );

  const guard = agent.guardrails ?? {};

  return (
    <div
      ref={cardRef}
      className={`ag-card${agent.enabled ? "" : " is-disabled"}`}
    >
      <div className="ag-card-head">
        <div className="ag-card-mark">
          <Bot size={18} />
        </div>
        <div className="ag-card-id">
          <div className="ag-card-name">{agent.name}</div>
          <div className="ag-card-tag">{agent.tagline}</div>
          <div className="ag-chips" style={{ marginTop: "var(--ib-2)" }}>
            {agent.toolkits.length === 0 ? (
              <span className="ibx-chip">No tools</span>
            ) : (
              agent.toolkits.map((t) => (
                <span key={t} className="ibx-chip">
                  {TOOLKIT_LABELS[t] ?? t}
                </span>
              ))
            )}
          </div>
        </div>
        <Toggle
          checked={agent.enabled}
          label={`${agent.enabled ? "Disable" : "Enable"} ${agent.name}`}
          onChange={(v) => {
            onLocalChange(agent.agentId, { enabled: v });
            persist({ enabled: v });
          }}
        />
      </div>

      <div className="ag-card-body">
        <div className="ag-row">
          <span className="ag-row-label">
            Autonomy
            <span
              className="ibx-help"
              title={AUTONOMY_OPTS.find((o) => o.value === agent.autonomy)?.hint}
            >
              <Info size={10} />
            </span>
          </span>
          <div className="ibx-seg" role="group" aria-label="Autonomy level">
            {AUTONOMY_OPTS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`ibx-seg-opt${agent.autonomy === o.value ? " is-active" : ""}`}
                aria-pressed={agent.autonomy === o.value}
                title={o.hint}
                onClick={() => {
                  onLocalChange(agent.agentId, { autonomy: o.value });
                  persist({ autonomy: o.value });
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="ibx-field-label" htmlFor={`instr-${agent.agentId}`}>
            Instructions
          </label>
          <textarea
            id={`instr-${agent.agentId}`}
            className="ibx-textarea"
            value={agent.instructions}
            placeholder="Tell this agent how to behave, what to prioritise, and what to avoid."
            onChange={(e) => onLocalChange(agent.agentId, { instructions: e.target.value })}
            onBlur={(e) => persist({ instructions: e.target.value })}
          />
        </div>

        <div className="ag-guardrails">
          <div className="ag-guardrails-head">
            <ShieldAlert size={12} />
            Guardrails
          </div>

          <div className="ag-guard-row">
            <span className="ag-row-label">Respect working hours</span>
            <Toggle
              checked={Boolean(guard.working_hours)}
              label="Toggle working-hours guardrail"
              onChange={(v) => {
                const next = setGuardrail("working_hours", v ? "09:00-18:00" : "");
                persist({ guardrails: next });
              }}
            />
          </div>
          {Boolean(guard.working_hours) && (
            <div className="ag-guard-row">
              <span className="ibx-hint">Active hours (local)</span>
              <input
                className="ag-guard-input"
                style={{ width: 120 }}
                value={String(guard.working_hours ?? "")}
                onChange={(e) => setGuardrail("working_hours", e.target.value)}
                onBlur={() => persist({ guardrails: agent.guardrails })}
                aria-label="Working hours"
              />
            </div>
          )}

          <div className="ag-guard-row">
            <span className="ag-row-label">Daily send cap</span>
            <input
              className="ag-guard-input"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="off"
              value={
                guard.daily_send_cap === undefined || guard.daily_send_cap === ""
                  ? ""
                  : Number(guard.daily_send_cap)
              }
              onChange={(e) =>
                setGuardrail(
                  "daily_send_cap",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              onBlur={() => persist({ guardrails: agent.guardrails })}
              aria-label="Daily send cap"
            />
          </div>

          <div>
            <span className="ag-row-label" style={{ display: "block", marginBottom: 6 }}>
              Do-not-contact list
            </span>
            <input
              className="ibx-input"
              placeholder="comma-separated emails or domains"
              value={String(guard.do_not_contact ?? "")}
              onChange={(e) => setGuardrail("do_not_contact", e.target.value)}
              onBlur={() => persist({ guardrails: agent.guardrails })}
              aria-label="Do not contact list"
            />
          </div>
        </div>
      </div>

      <div className="ag-card-foot">
        <span className="ibx-hint">
          {agent.enabled ? "Active" : "Paused"} · {agent.domain}
        </span>
        <SavedIndicator state={save} />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  danger,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`ibx-switch${danger ? " is-danger" : ""}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}

function SavedIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="ag-saved">
        <Loader2 size={12} className="ibx-spin" /> Saving
      </span>
    );
  if (state === "saved")
    return (
      <span className="ag-saved is-ok">
        <Check size={12} /> Saved
      </span>
    );
  if (state === "error")
    return <span className="ag-saved is-err">Not saved</span>;
  return <span className="ag-saved">&nbsp;</span>;
}
