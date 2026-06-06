"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessagesSquare,
  CalendarCheck,
  Target,
  Repeat,
  ShieldAlert,
  LifeBuoy,
  BookOpen,
  GitBranch,
  Sparkles,
  Activity,
  ChevronLeft,
  Search,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, type CortexData, type Session } from "./sessions";

const ICONS: Record<string, LucideIcon> = {
  MessagesSquare,
  CalendarCheck,
  Target,
  Repeat,
  ShieldAlert,
  LifeBuoy,
  BookOpen,
  GitBranch,
  Sparkles,
  Activity,
};

const STATUS_COLOR: Record<Session["status"], string> = {
  resolved: "#7df5c8",
  active: "#6ea8ff",
  booked: "#67e8f9",
  escalated: "#ffb86b",
  archived: "#8a93ad",
};

export interface PanelProps {
  data: CortexData;
  selected: string | null;
  onSelect: (id: string | null) => void;
  maxCount: number;
}

export function MemoryPanel({ data, selected, onSelect, maxCount }: PanelProps) {
  const [query, setQuery] = useState("");

  const selectedCat = useMemo(
    () => CATEGORIES.find((c) => c.id === selected) ?? null,
    [selected],
  );

  const filtered = useMemo(() => {
    if (!selected) return [];
    const rows = data.sessions[selected] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.snippet.toLowerCase().includes(q) ||
        r.who.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [selected, query, data]);

  return (
    <div className="cortex-panel">
      <AnimatePresence mode="wait" initial={false}>
        {!selectedCat ? (
          <motion.div
            key="list"
            className="cortex-panel-inner"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="cortex-panel-head">
              <div className="cortex-panel-eyebrow">Memory regions</div>
              <div className="cortex-panel-h">Browse the cortex</div>
              <div className="cortex-panel-note">Click a region to read its sorted sessions.</div>
            </div>
            <div className="cortex-cat-list">
              {CATEGORIES.map((cat) => {
                const Icon = ICONS[cat.icon] ?? Activity;
                const count = data.counts[cat.id] ?? 0;
                const pct = Math.max(0.08, count / maxCount);
                return (
                  <button
                    key={cat.id}
                    className="cortex-cat-row"
                    onClick={() => {
                      setQuery("");
                      onSelect(cat.id);
                    }}
                  >
                    <span
                      className="cortex-cat-dot"
                      style={{ background: cat.color, boxShadow: `0 0 9px ${cat.color}` }}
                    />
                    <Icon className="cortex-cat-icon" size={14} style={{ color: cat.color }} />
                    <span className="cortex-cat-label">{cat.label}</span>
                    <span className="cortex-cat-count">{count.toLocaleString()}</span>
                    <span className="cortex-cat-bar">
                      <span
                        className="cortex-cat-bar-fill"
                        style={{ width: `${pct * 100}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}` }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            className="cortex-panel-inner"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button className="cortex-back" onClick={() => onSelect(null)}>
              <ChevronLeft size={13} />
              All regions
            </button>

            <div className="cortex-detail-head">
              <span
                className="cortex-cat-dot lg"
                style={{ background: selectedCat.color, boxShadow: `0 0 12px ${selectedCat.color}` }}
              />
              <div>
                <div className="cortex-detail-title" style={{ textShadow: `0 0 16px ${selectedCat.color}66` }}>
                  {selectedCat.label}
                </div>
                <div className="cortex-detail-count">
                  {(data.counts[selectedCat.id] ?? 0).toLocaleString()} sessions sorted
                </div>
              </div>
            </div>
            <div className="cortex-detail-desc">{selectedCat.desc}</div>

            <div className="cortex-search">
              <Search size={13} className="cortex-search-icon" />
              <input
                className="cortex-search-input"
                placeholder="Search sessions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
              />
            </div>

            <div className="cortex-session-list">
              {filtered.length === 0 ? (
                <div className="cortex-empty">No sessions match that search.</div>
              ) : (
                filtered.map((s) => (
                  <div className="cortex-session" key={s.id}>
                    <div className="cortex-session-top">
                      <span className="cortex-session-title">{s.title}</span>
                      <span className="cortex-session-ts">{s.ts}</span>
                    </div>
                    <div className="cortex-session-snip">{s.snippet}</div>
                    <div className="cortex-session-meta">
                      <span className="cortex-chip">{s.who}</span>
                      <span
                        className="cortex-chip status"
                        style={{
                          color: STATUS_COLOR[s.status],
                          borderColor: `${STATUS_COLOR[s.status]}55`,
                        }}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
