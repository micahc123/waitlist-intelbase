// Global search launcher for the /app topbar.
//
// Renders as the topbar search "input" (a button styled to look like the old
// input). Clicking it, or pressing Cmd/Ctrl-K or "/" anywhere in the app, opens
// a centered command-palette overlay: an input + grouped results across Leads,
// Contacts, Conversations, Tasks, and Knowledge (debounced fetch to
// /api/app/search?q=). Arrow keys move the selection; Enter selects; selecting a
// result jumps to its view via onNavigate and closes. With an empty query the
// palette shows "jump to view" shortcuts. Esc / backdrop closes.

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  CornerDownLeft,
  LayoutDashboard,
  Inbox as InboxIcon,
  ShieldCheck,
  Users,
  ListTodo,
  Calendar,
  Bot,
  BookOpen,
  BarChart3,
} from "lucide-react";
import type { ViewKey } from "./app-shell";
import type { SearchGroup } from "@/app/api/app/search/route";
import "./global-search.css";

// Quick jumps shown when the query is empty.
const SHORTCUTS: Array<{ view: ViewKey; label: string; Icon: typeof Search }> = [
  { view: "overview", label: "Overview", Icon: LayoutDashboard },
  { view: "inbox", label: "Inbox", Icon: InboxIcon },
  { view: "approvals", label: "Approvals", Icon: ShieldCheck },
  { view: "leads", label: "Leads", Icon: Users },
  { view: "tasks", label: "Tasks", Icon: ListTodo },
  { view: "calendar", label: "Calendar", Icon: Calendar },
  { view: "agents", label: "Agents", Icon: Bot },
  { view: "knowledge", label: "Knowledge", Icon: BookOpen },
  { view: "insights", label: "Insights", Icon: BarChart3 },
];

// A flat row in the palette: either a result or a shortcut. `key` is unique.
interface FlatRow {
  key: string;
  view: ViewKey;
  title: string;
  subtitle: string | null;
  id?: string;
}

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
}

export function GlobalSearch({
  onNavigate,
}: {
  onNavigate: (view: ViewKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Open on Cmd/Ctrl-K or "/" anywhere (unless typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      const metaK = (e.metaKey || e.ctrlKey) && k === "k";
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (metaK) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset + focus on open.
  useEffect(() => {
    if (open) {
      setQuery("");
      setGroups([]);
      setActive(0);
      // Focus after the overlay paints.
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced fetch.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/app/search?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal, cache: "no-store" },
        );
        const data = (await res.json()) as { groups: SearchGroup[] };
        setGroups(data.groups ?? []);
        setActive(0);
      } catch {
        // aborted or failed; leave prior results
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  // Build the flat, navigable row list (used for arrow-key selection).
  const { rows, sections } = useMemo(() => {
    const flat: FlatRow[] = [];
    const secs: Array<{ label: string; rows: FlatRow[] }> = [];
    if (!query.trim()) {
      const sc: FlatRow[] = SHORTCUTS.map((s) => ({
        key: `shortcut-${s.view}`,
        view: s.view,
        title: s.label,
        subtitle: null,
      }));
      flat.push(...sc);
      secs.push({ label: "Jump to", rows: sc });
    } else {
      for (const g of groups) {
        const gr: FlatRow[] = g.items.map((it) => ({
          key: `${g.key}-${it.id}`,
          view: g.view as ViewKey,
          title: it.title,
          subtitle: it.subtitle,
          id: it.id,
        }));
        flat.push(...gr);
        secs.push({ label: g.label, rows: gr });
      }
    }
    return { rows: flat, sections: secs };
  }, [groups, query]);

  const close = useCallback(() => setOpen(false), []);

  const select = useCallback(
    (row: FlatRow | undefined) => {
      if (!row) return;
      onNavigate(row.view);
      setOpen(false);
    },
    [onNavigate],
  );

  // Keyboard nav within the palette.
  const onInputKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (rows.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % rows.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + rows.length) % rows.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        select(rows[active]);
      }
    },
    [rows, active, close, select],
  );

  // Keep the active row in view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const mac = isMac();
  const q = query.trim();
  const showShortcuts = !q;
  const noResults = Boolean(q) && !loading && rows.length === 0;

  return (
    <>
      <button
        type="button"
        className="app-gsearch-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="app-search-icon" size={15} />
        <span className="app-gsearch-placeholder">
          Search leads, conversations, agents...
        </span>
        <kbd className="app-gsearch-kbd">{mac ? "Cmd" : "Ctrl"} K</kbd>
      </button>

      {open && (
        <div
          className="app-gsearch-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="app-gsearch-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
          >
            <div className="app-gsearch-inputwrap">
              <Search size={17} className="app-gsearch-inputicon" />
              <input
                ref={inputRef}
                className="app-gsearch-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search across your workspace..."
                aria-label="Search query"
                autoComplete="off"
                spellCheck={false}
              />
              {loading && <span className="app-gsearch-spinner" aria-hidden="true" />}
            </div>

            <div className="app-gsearch-results" ref={listRef}>
              {showShortcuts && (
                <div className="app-gsearch-hint">Jump to a view or start typing</div>
              )}

              {noResults && (
                <div className="app-gsearch-empty">
                  No matches for &ldquo;{q}&rdquo;
                </div>
              )}

              {sections.map((sec) => (
                <div className="app-gsearch-group" key={sec.label}>
                  <div className="app-gsearch-grouplabel">{sec.label}</div>
                  {sec.rows.map((row) => {
                    const idx = rows.indexOf(row);
                    const isActive = idx === active;
                    const ShortcutIcon = showShortcuts
                      ? SHORTCUTS.find((s) => s.view === row.view)?.Icon
                      : undefined;
                    return (
                      <button
                        type="button"
                        key={row.key}
                        data-active={isActive}
                        className={`app-gsearch-row${isActive ? " is-active" : ""}`}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => select(row)}
                      >
                        {ShortcutIcon && (
                          <span className="app-gsearch-rowicon" aria-hidden="true">
                            <ShortcutIcon size={15} strokeWidth={2} />
                          </span>
                        )}
                        <span className="app-gsearch-rowtext">
                          <span className="app-gsearch-rowtitle">{row.title}</span>
                          {row.subtitle && (
                            <span className="app-gsearch-rowsub">
                              {row.subtitle}
                            </span>
                          )}
                        </span>
                        {row.id && (
                          <span className="app-gsearch-rowid ibx-mono">
                            {row.id}
                          </span>
                        )}
                        {isActive && (
                          <CornerDownLeft
                            size={13}
                            className="app-gsearch-enter"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="app-gsearch-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
