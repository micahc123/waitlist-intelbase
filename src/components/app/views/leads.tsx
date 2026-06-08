// Leads - the CRM surface. Stage-count pills + total pipeline value over a dense,
// sortable, searchable data table. Each row's stage is an inline select that
// moves the lead between stages with an optimistic update (POST /api/app/leads).
// Reads from /api/app/leads, which serves deterministic DEMO data when Supabase
// is unconfigured so the CRM populates with no keys.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, Users } from "lucide-react";
import { ViewHead, ErrorState } from "./view-shell";
import type { Lead, LeadStage, LeadStageCounts } from "@/lib/db/types";
import "./leads.css";

const STAGES: LeadStage[] = ["new", "qualified", "booked", "won", "lost"];

const KNOWN_SOURCES = new Set(["Web", "Ads", "WhatsApp", "Referral"]);

type SortKey = "value" | "created" | "score";
type SortDir = "asc" | "desc";

function hkd(cents: number): string {
  return `HK$${Math.round(cents / 100).toLocaleString("en-HK")}`;
}

function relativeAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hr = Math.round(diff / 3600000);
  if (hr < 1) return "just now";
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function scoreClass(score: number): string {
  if (score >= 75) return "";
  if (score >= 55) return "is-mid";
  return "is-low";
}

// Sortable column header. The <th> carries aria-sort; the actual control is a
// real <button> inside it (correct a11y: aria-sort belongs on the columnheader,
// not on a button role). Declared at module scope so it is not recreated on
// every render of Leads.
function SortHeader({
  label,
  active,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onSort: () => void;
  align?: "left" | "right";
}) {
  const sort: "ascending" | "descending" | "none" = active
    ? dir === "asc"
      ? "ascending"
      : "descending"
    : "none";
  return (
    <th scope="col" aria-sort={sort} style={align === "right" ? { textAlign: "right" } : undefined}>
      <button type="button" className="leads-sort-btn" onClick={onSort}>
        <span className="leads-th-inner">
          {label}
          {!active && <ChevronsUpDown size={13} />}
          {active && dir === "asc" && <ArrowUp size={13} />}
          {active && dir === "desc" && <ArrowDown size={13} />}
        </span>
      </button>
    </th>
  );
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<LeadStageCounts | null>(null);
  const [pipeline, setPipeline] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const load = useCallback(() => {
    let active = true;
    setError(false);
    setLeads(null);
    fetch("/api/app/leads")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(
        (data: {
          leads: Lead[];
          counts: LeadStageCounts;
          pipelineValueCents: number;
        }) => {
          if (!active) return;
          setLeads(data.leads ?? []);
          setCounts(data.counts ?? null);
          setPipeline(data.pipelineValueCents ?? 0);
        },
      )
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  // Recompute the header pills + pipeline from the live rows so an optimistic
  // stage change is reflected in the header without a refetch.
  const liveCounts = useMemo<LeadStageCounts>(() => {
    const base: LeadStageCounts = {
      new: 0,
      qualified: 0,
      booked: 0,
      won: 0,
      lost: 0,
    };
    (leads ?? []).forEach((l) => {
      base[l.stage] += 1;
    });
    return leads ? base : (counts ?? base);
  }, [leads, counts]);

  const livePipeline = useMemo<number>(() => {
    if (!leads) return pipeline ?? 0;
    return leads
      .filter((l) => l.stage !== "lost")
      .reduce((sum, l) => sum + (l.value_cents ?? 0), 0);
  }, [leads, pipeline]);

  const onSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey],
  );

  const visible = useMemo(() => {
    let rows = [...(leads ?? [])];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.company ?? "").toLowerCase().includes(q) ||
          (l.source ?? "").toLowerCase().includes(q) ||
          l.stage.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "value") cmp = a.value_cents - b.value_cents;
      else if (sortKey === "score") cmp = a.score - b.score;
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [leads, query, sortKey, sortDir]);

  const onStageChange = useCallback((id: string, stage: LeadStage) => {
    // Optimistic: move the row locally, then persist. On a failed write (e.g.
    // demo mode where the data layer no-ops) the local move stands so the demo
    // stays interactive.
    setLeads((prev) =>
      prev
        ? prev.map((l) =>
            l.id === id
              ? { ...l, stage, updated_at: new Date().toISOString() }
              : l,
          )
        : prev,
    );
    fetch("/api/app/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    }).catch(() => {
      /* keep the optimistic move; demo / offline tolerant */
    });
  }, []);

  const PILLS: Array<{ key: keyof LeadStageCounts; label: string; mod: string }> = [
    { key: "new", label: "New", mod: "is-new" },
    { key: "qualified", label: "Qualified", mod: "is-qualified" },
    { key: "booked", label: "Booked", mod: "is-booked" },
    { key: "won", label: "Won", mod: "is-won" },
  ];

  return (
    <div className="ibx">
      <ViewHead
        title="Leads"
        subtitle="People who reached out, captured and qualified automatically."
      />

      {error && (
        <ErrorState
          message="We could not load your leads. Check your connection and try again."
          onRetry={load}
        />
      )}

      {!error && (
      <>
      <div className="leads-bar">
        <div className="leads-pills">
          {PILLS.map((p) => (
            <div key={p.key} className={`leads-pill ${p.mod}`}>
              <span className="leads-pill-label">{p.label}</span>
              <span className="leads-pill-value">
                {leads === null ? "--" : liveCounts[p.key]}
              </span>
            </div>
          ))}
        </div>
        <div className="leads-pipeline">
          <div className="leads-pipeline-label">Pipeline value</div>
          <div className="leads-pipeline-value">
            {leads === null ? "HK$--" : hkd(livePipeline)}
          </div>
        </div>
      </div>

      <div className="ibx-panel">
        <div className="leads-toolbar">
          <div className="leads-search">
            <Search size={15} />
            <input
              className="ibx-input"
              type="search"
              placeholder="Search name, company, source..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search leads"
            />
          </div>
          {leads !== null && (
            <span className="leads-result-count">
              {visible.length} of {leads.length}
            </span>
          )}
        </div>

        <div className="leads-table-wrap">
          <table className="ibx-table leads-table">
            <thead>
              <tr>
                <th scope="col">Lead</th>
                <th scope="col">Source</th>
                <SortHeader
                  label="Score"
                  active={sortKey === "score"}
                  dir={sortDir}
                  onSort={() => onSort("score")}
                />
                <SortHeader
                  label="Value"
                  active={sortKey === "value"}
                  dir={sortDir}
                  onSort={() => onSort("value")}
                  align="right"
                />
                <th scope="col">Stage</th>
                <SortHeader
                  label="Age"
                  active={sortKey === "created"}
                  dir={sortDir}
                  onSort={() => onSort("created")}
                />
              </tr>
            </thead>
            <tbody>
              {leads === null &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td colSpan={6}>
                      <div
                        className="inbox-skel"
                        style={{ height: "16px", width: "100%" }}
                      />
                    </td>
                  </tr>
                ))}

              {leads !== null &&
                visible.map((l) => {
                  const srcKey = KNOWN_SOURCES.has(l.source ?? "")
                    ? l.source
                    : "fallback";
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="leads-name">{l.name}</div>
                        <div className="leads-company">
                          {l.company ?? "--"}
                        </div>
                      </td>
                      <td>
                        <span className={`leads-src leads-src-${srcKey}`}>
                          {l.source ?? "Unknown"}
                        </span>
                      </td>
                      <td>
                        <span className="leads-score">
                          <span className="leads-score-track">
                            <span
                              className={`leads-score-fill ${scoreClass(l.score)}`}
                              style={{ width: `${l.score}%` }}
                            />
                          </span>
                          {l.score}
                        </span>
                      </td>
                      <td className="ibx-td-num">{hkd(l.value_cents)}</td>
                      <td>
                        <select
                          className={`leads-stage-select stage-${l.stage}`}
                          value={l.stage}
                          onChange={(e) =>
                            onStageChange(l.id, e.target.value as LeadStage)
                          }
                          aria-label={`Stage for ${l.name}`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="leads-age">{relativeAge(l.created_at)}</td>
                    </tr>
                  );
                })}

              {leads !== null && visible.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="ibx-empty">
                      <div className="ibx-empty-icon">
                        <Users size={22} />
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                        {leads.length === 0
                          ? "No leads yet"
                          : "No leads match your search"}
                      </div>
                      <div style={{ maxWidth: "36ch" }}>
                        {leads.length === 0
                          ? "New contacts are enriched, scored, and routed into your pipeline here as they arrive."
                          : "Try a different name, company, or source."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
