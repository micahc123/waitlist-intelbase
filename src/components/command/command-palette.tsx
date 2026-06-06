"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Lucide from "lucide-react";
import { useSim } from "@/lib/command/use-sim";
import type { ViewId } from "@/lib/command/types";

type ResultKind = "view" | "domain" | "node";

interface PaletteItem {
  id: string;
  kind: ResultKind;
  label: string;
  sub: string; // mono id / domain tag
  icon: keyof typeof Lucide;
  color?: string;
  run: () => void;
}

const VIEWS: Array<{ id: ViewId; label: string; icon: keyof typeof Lucide }> = [
  { id: "agents", label: "Agents", icon: "Boxes" },
  { id: "brain", label: "Brain", icon: "BrainCircuit" },
  { id: "deck", label: "Deck", icon: "LayoutDashboard" },
  { id: "team", label: "Team", icon: "Users" },
  { id: "usage", label: "Usage", icon: "Activity" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

const KIND_META: Record<ResultKind, { label: string; icon: keyof typeof Lucide }> = {
  view: { label: "View", icon: "LayoutDashboard" },
  domain: { label: "Domain", icon: "Network" },
  node: { label: "Agent", icon: "CircuitBoard" },
};

function score(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx === 0) return 100;
  if (idx > 0) return 60 - idx;
  // loose subsequence fuzzy
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 20 : -1;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { nodes, domains, setView, setActiveDomain, setSelected } = useSim();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<PaletteItem[]>(() => {
    const out: PaletteItem[] = [];

    VIEWS.forEach((v) =>
      out.push({
        id: `view:${v.id}`,
        kind: "view",
        label: v.label,
        sub: `view / ${v.id}`,
        icon: v.icon,
        run: () => setView(v.id),
      })
    );

    domains.forEach((d) =>
      out.push({
        id: `domain:${d.id}`,
        kind: "domain",
        label: d.label,
        sub: `domain / ${d.id}`,
        icon: (d.icon as keyof typeof Lucide) || "Network",
        color: d.color,
        run: () => setActiveDomain(d.id),
      })
    );

    nodes.forEach((n) =>
      out.push({
        id: `node:${n.id}`,
        kind: "node",
        label: n.label,
        sub: `${n.kind} / ${n.id}`,
        icon: (n.icon as keyof typeof Lucide) || "CircuitBoard",
        run: () => {
          setView("agents");
          setSelected(n.id);
        },
      })
    );

    return out;
  }, [nodes, domains, setView, setActiveDomain, setSelected]);

  const results = useMemo(() => {
    return items
      .map((it) => ({ it, s: Math.max(score(query, it.label), score(query, it.sub) - 10) }))
      .filter((r) => r.s > -1)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.it);
  }, [items, query]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep active row in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results.length]);

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      const it = results[active];
      if (it) {
        it.run();
        onClose();
      }
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="palette-panel"
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="palette-search">
              <Lucide.Search size={16} strokeWidth={1.75} className="palette-search-icon" />
              <input
                ref={inputRef}
                className="palette-input"
                placeholder="Search agents, domains, views..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
              <span className="palette-hint">esc</span>
            </div>

            <div className="palette-list" ref={listRef}>
              {results.length === 0 && (
                <div className="palette-empty">No matches for &ldquo;{query}&rdquo;</div>
              )}
              {results.map((it, i) => {
                const Icon = (Lucide[it.icon] || Lucide.Circle) as React.ComponentType<{
                  size?: number;
                  strokeWidth?: number;
                }>;
                const KindIcon = Lucide[KIND_META[it.kind].icon] as React.ComponentType<{
                  size?: number;
                  strokeWidth?: number;
                }>;
                return (
                  <button
                    key={it.id}
                    type="button"
                    data-row={i}
                    className={`palette-row${i === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      it.run();
                      onClose();
                    }}
                  >
                    <span
                      className="palette-row-icon"
                      style={it.color ? { color: it.color } : undefined}
                    >
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <span className="palette-row-label">{it.label}</span>
                    <span className="palette-row-sub">{it.sub}</span>
                    <span className={`palette-row-kind palette-kind--${it.kind}`}>
                      <KindIcon size={11} strokeWidth={2} />
                      {KIND_META[it.kind].label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="palette-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span className="palette-footer-count">{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
