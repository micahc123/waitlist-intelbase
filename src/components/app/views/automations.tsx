// Automations - the workflow rules. A list of rules, each showing its name, a
// readable trigger -> steps summary (chips joined by arrows), an enable toggle
// (optimistic -> POST /api/app/automations {op:"toggle"}), a runs count, and the
// last run relative. Selecting a rule renders it as a small force-graph (a trigger
// node linked to its step nodes). A "New automation" panel builds a rule from a
// trigger select + preset step chips and POSTs {op:"create"} (best-effort). Reads
// from /api/app/automations, which serves deterministic DEMO data when Supabase is
// unconfigured so the surface populates with no keys; writes no-op gracefully so
// the optimistic toggle/add stands.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Workflow,
  Plus,
  ArrowRight,
  Zap,
  X,
  Check,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import { ForceGraph, type GraphLink, type GraphNode } from "../graph/force-graph";
import type { Automation } from "@/lib/db/types";
import "./automations.css";

// ---- human-readable labels for triggers + steps ---------------------------

const TRIGGER_OPTIONS: Array<{ value: string; label: string; payload: Record<string, unknown> }> = [
  { value: "lead.created", label: "New lead arrives", payload: { event: "lead.created" } },
  { value: "lead.idle", label: "Lead goes quiet (14d)", payload: { event: "lead.idle", days: 14 } },
  { value: "booking.upcoming", label: "Booking is upcoming", payload: { event: "booking.upcoming", hours_before: 24 } },
  { value: "lead.stage_changed", label: "Deal marked Won", payload: { event: "lead.stage_changed", to: "won" } },
  { value: "schedule.daily", label: "Every morning", payload: { event: "schedule.daily", at: "08:30" } },
];

const STEP_OPTIONS: Array<{ type: string; label: string }> = [
  { type: "send_email", label: "Send email" },
  { type: "send_whatsapp", label: "Send WhatsApp" },
  { type: "send_followup", label: "Send follow-up" },
  { type: "book_call", label: "Book a call" },
  { type: "wait", label: "Wait 3 days" },
  { type: "request_review", label: "Request review" },
  { type: "compile_summary", label: "Compile summary" },
  { type: "post_to_team", label: "Notify team" },
];

const TRIGGER_LABELS: Record<string, string> = {
  "lead.created": "New lead",
  "lead.idle": "Lead goes quiet",
  "booking.upcoming": "Booking upcoming",
  "lead.stage_changed": "Stage change",
  "schedule.daily": "Daily schedule",
};

const STEP_LABELS: Record<string, string> = {
  send_email: "Send email",
  send_whatsapp: "Send WhatsApp",
  send_followup: "Send follow-up",
  book_call: "Book call",
  wait: "Wait",
  request_review: "Request review",
  compile_summary: "Compile summary",
  post_to_team: "Notify team",
};

function triggerLabel(trigger: Record<string, unknown>): string {
  const event = String(trigger.event ?? "");
  let base = TRIGGER_LABELS[event] ?? event.replace(/[._]/g, " ") ?? "Trigger";
  if (event === "lead.idle" && trigger.days) base += ` (${trigger.days}d)`;
  if (event === "lead.stage_changed" && trigger.to) base += ` -> ${trigger.to}`;
  if (event === "schedule.daily" && trigger.at) base += ` ${trigger.at}`;
  return base;
}

function stepLabel(step: Record<string, unknown>): string {
  const type = String(step.type ?? "");
  return STEP_LABELS[type] ?? type.replace(/_/g, " ");
}

function relative(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function Automations() {
  const [rules, setRules] = useState<Automation[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/app/automations")
      .then((r) => r.json())
      .then((data: { automations: Automation[] }) => {
        if (active) setRules(data.automations ?? []);
      })
      .catch(() => {
        if (active) setRules([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback((id: string, enabled: boolean) => {
    setRules((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, enabled } : r)) : prev,
    );
    fetch("/api/app/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "toggle", id, enabled }),
    }).catch(() => {
      /* keep optimistic toggle */
    });
  }, []);

  const addRule = useCallback(
    (name: string, trigger: Record<string, unknown>, steps: Array<Record<string, unknown>>) => {
      const optimistic: Automation = {
        id: `local-${Date.now()}`,
        org_id: "demo-org",
        name,
        enabled: true,
        trigger,
        steps,
        last_run_at: null,
        runs: 0,
        created_at: new Date().toISOString(),
      };
      setRules((prev) => (prev ? [optimistic, ...prev] : [optimistic]));
      setAdding(false);
      setSelectedId(optimistic.id);
      fetch("/api/app/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "create", name, trigger, steps }),
      }).catch(() => {
        /* keep optimistic add */
      });
    },
    [],
  );

  const selected = useMemo(
    () => (rules ?? []).find((r) => r.id === selectedId) ?? null,
    [rules, selectedId],
  );

  return (
    <div className="ibx autos">
      <ViewHead
        title="Automations"
        subtitle="The rules that run your business while you sleep - a trigger, then a sequence of steps your agents carry out."
      />

      <div className="autos-bar">
        <span className="autos-count">
          {rules === null
            ? "Loading rules..."
            : `${rules.length} rule${rules.length === 1 ? "" : "s"} · ${rules.filter((r) => r.enabled).length} active`}
        </span>
        <button
          type="button"
          className="ibx-btn ibx-btn-primary"
          onClick={() => setAdding((a) => !a)}
          aria-expanded={adding}
        >
          <Plus size={15} />
          New automation
        </button>
      </div>

      {adding && (
        <NewAutomation onAdd={addRule} onCancel={() => setAdding(false)} />
      )}

      <div className="autos-layout">
        <div className="autos-list">
          {rules === null &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="autos-rule-skel" aria-hidden="true" />
            ))}

          {rules !== null &&
            rules.map((r) => (
              <RuleCard
                key={r.id}
                rule={r}
                selected={selectedId === r.id}
                onSelect={() =>
                  setSelectedId((id) => (id === r.id ? null : r.id))
                }
                onToggle={toggle}
              />
            ))}

          {rules !== null && rules.length === 0 && (
            <div className="ibx-panel">
              <div className="ibx-empty">
                <div className="ibx-empty-icon">
                  <Workflow size={22} />
                </div>
                <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                  No automations yet
                </div>
                <div style={{ maxWidth: "40ch" }}>
                  Build a rule with New automation: pick a trigger, then add the
                  steps you want your agents to run.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* rule map */}
        <aside className="ibx-panel autos-map">
          <div className="ibx-panel-head">
            <span className="autos-map-title">Rule map</span>
          </div>
          {selected ? (
            <RuleGraph rule={selected} />
          ) : (
            <div className="autos-map-empty">
              Select a rule to see its trigger and steps as a flow.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function RuleCard({
  rule,
  selected,
  onSelect,
  onToggle,
}: {
  rule: Automation;
  selected: boolean;
  onSelect: () => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className={`autos-rule${selected ? " is-selected" : ""}`}>
      <button
        type="button"
        className="autos-rule-main"
        onClick={onSelect}
        aria-pressed={selected}
      >
        <div className="autos-rule-head">
          <span className="autos-rule-name">{rule.name}</span>
        </div>
        <div className="autos-flow">
          <span className="autos-chip autos-chip-trigger">
            <Zap size={11} />
            {triggerLabel(rule.trigger)}
          </span>
          {rule.steps.map((s, i) => (
            <span key={i} className="autos-flow-seg">
              <ArrowRight size={12} className="autos-arrow" />
              <span className="autos-chip">{stepLabel(s)}</span>
            </span>
          ))}
        </div>
        <div className="autos-rule-meta">
          <span className="ibx-mono">{rule.runs.toLocaleString()} runs</span>
          <span className="autos-dot" aria-hidden="true">
            ·
          </span>
          <span className="ibx-mono">last run {relative(rule.last_run_at)}</span>
        </div>
      </button>

      <label className="autos-toggle" title={rule.enabled ? "Enabled" : "Disabled"}>
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={(e) => onToggle(rule.id, e.target.checked)}
          aria-label={`${rule.enabled ? "Disable" : "Enable"} ${rule.name}`}
        />
        <span className="autos-toggle-track" aria-hidden="true">
          <span className="autos-toggle-thumb" />
        </span>
      </label>
    </div>
  );
}

function RuleGraph({ rule }: { rule: Automation }) {
  const { nodes, links } = useMemo(() => {
    const nodes: GraphNode[] = [
      {
        id: "trigger",
        label: triggerLabel(rule.trigger),
        kind: "core",
        size: 11,
      },
    ];
    const links: GraphLink[] = [];
    rule.steps.forEach((s, i) => {
      const id = `step-${i}`;
      nodes.push({ id, label: stepLabel(s), kind: "agent", size: 7 });
      links.push({ source: i === 0 ? "trigger" : `step-${i - 1}`, target: id });
    });
    return { nodes, links };
  }, [rule]);

  return (
    <div className="autos-graph">
      <ForceGraph nodes={nodes} links={links} height={300} />
    </div>
  );
}

function NewAutomation({
  onAdd,
  onCancel,
}: {
  onAdd: (
    name: string,
    trigger: Record<string, unknown>,
    steps: Array<Record<string, unknown>>,
  ) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [triggerValue, setTriggerValue] = useState(TRIGGER_OPTIONS[0].value);
  const [steps, setSteps] = useState<string[]>([]);

  const addStep = (type: string) => setSteps((s) => [...s, type]);
  const removeStep = (idx: number) =>
    setSteps((s) => s.filter((_, i) => i !== idx));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || steps.length === 0) return;
    const trig =
      TRIGGER_OPTIONS.find((t) => t.value === triggerValue)?.payload ?? {};
    onAdd(
      trimmed,
      trig,
      steps.map((type) => ({ type })),
    );
  };

  return (
    <form className="ibx-panel autos-new" onSubmit={submit}>
      <div className="autos-new-row">
        <label className="autos-field">
          <span className="autos-field-label">Name</span>
          <input
            className="ibx-input"
            type="text"
            placeholder="e.g. New lead welcome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>
        <label className="autos-field">
          <span className="autos-field-label">When this happens</span>
          <select
            className="ibx-input autos-trigger-select"
            value={triggerValue}
            onChange={(e) => setTriggerValue(e.target.value)}
          >
            {TRIGGER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="autos-field-label">Then do these steps</div>
      {steps.length > 0 && (
        <div className="autos-new-steps">
          <span className="autos-chip autos-chip-trigger">
            <Zap size={11} />
            {TRIGGER_OPTIONS.find((t) => t.value === triggerValue)?.label}
          </span>
          {steps.map((type, i) => (
            <span key={i} className="autos-flow-seg">
              <ArrowRight size={12} className="autos-arrow" />
              <span className="autos-chip autos-chip-removable">
                {STEP_LABELS[type] ?? type}
                <button
                  type="button"
                  className="autos-chip-x"
                  onClick={() => removeStep(i)}
                  aria-label={`Remove ${STEP_LABELS[type] ?? type}`}
                >
                  <X size={11} />
                </button>
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="autos-step-palette">
        {STEP_OPTIONS.map((s) => (
          <button
            key={s.type}
            type="button"
            className="autos-step-add"
            onClick={() => addStep(s.type)}
          >
            <Plus size={12} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="autos-new-actions">
        <button
          type="submit"
          className="ibx-btn ibx-btn-primary"
          disabled={!name.trim() || steps.length === 0}
        >
          <Check size={15} />
          Create automation
        </button>
        <button type="button" className="ibx-btn ibx-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
