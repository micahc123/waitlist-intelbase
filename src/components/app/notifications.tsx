// Notifications center for the /app topbar.
//
// A bell button with an unread-count badge. Clicking opens a dropdown panel
// (header + "Mark all read" + a scrollable list). Clicking an item marks it read
// (optimistic, then POST) and, if its `link` maps to a ViewKey, navigates there
// and closes. Data is fetched on open from /api/app/notifications; the route
// falls back to demo data so the bell stays populated with no keys.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Inbox as InboxIcon,
  Users,
  Bot,
  ShieldCheck,
  Info,
} from "lucide-react";
import type { ViewKey } from "./app-shell";
import type { AppNotification, NotificationKind } from "@/lib/db/types";
import "./notifications.css";

// Map a notification's free-form `link` string to a known ViewKey. Unknown or
// null links are non-navigable (the item still marks read).
const LINK_TO_VIEW: Record<string, ViewKey> = {
  overview: "overview",
  approvals: "approvals",
  inbox: "inbox",
  leads: "leads",
  contacts: "contacts",
  tasks: "tasks",
  calendar: "calendar",
  agents: "agents",
  automations: "automations",
  knowledge: "knowledge",
  insights: "insights",
  settings: "settings",
};

const KIND_META: Record<
  NotificationKind,
  { Icon: typeof Bell; tint: string }
> = {
  approval: { Icon: ShieldCheck, tint: "amber" },
  lead: { Icon: Users, tint: "mint" },
  inbox: { Icon: InboxIcon, tint: "blue" },
  agent: { Icon: Bot, tint: "violet" },
  system: { Icon: Info, tint: "muted" },
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  return `${w}w ago`;
}

export function Notifications({
  onNavigate,
}: {
  onNavigate: (view: ViewKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/app/notifications", { cache: "no-store" });
      const data = (await res.json()) as {
        notifications: AppNotification[];
        unread: number;
      };
      setItems(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      // Leave whatever we have; the bell degrades quietly.
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  // Fetch the unread count once on mount so the badge is right before first open.
  useEffect(() => {
    load();
  }, [load]);

  // Refetch the full list each time the panel opens (cheap, keeps it fresh).
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markOneRead = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target || target.read) return prev;
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
    setUnread((u) => Math.max(0, u - 1));
    void fetch("/api/app/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "read", id }),
    });
  }, []);

  const markAll = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    void fetch("/api/app/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "readAll" }),
    });
  }, []);

  const onItemClick = useCallback(
    (n: AppNotification) => {
      markOneRead(n.id);
      const view = n.link ? LINK_TO_VIEW[n.link] : undefined;
      if (view) {
        onNavigate(view);
        setOpen(false);
      }
    },
    [markOneRead, onNavigate],
  );

  return (
    <div className="app-notif" ref={wrapRef}>
      <button
        type="button"
        className="app-notif-bell"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={17} strokeWidth={2} />
        {unread > 0 && (
          <span className="app-notif-badge" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="app-notif-panel" role="dialog" aria-label="Notifications">
          <div className="app-notif-head">
            <span className="app-notif-title">Notifications</span>
            <button
              type="button"
              className="app-notif-markall"
              onClick={markAll}
              disabled={unread === 0}
            >
              <CheckCheck size={13} strokeWidth={2} />
              Mark all read
            </button>
          </div>

          <div className="app-notif-list">
            {loading && !loaded ? (
              <div className="app-notif-empty">Loading...</div>
            ) : items.length === 0 ? (
              <div className="app-notif-empty">
                <Bell size={24} strokeWidth={1.5} />
                <span>You are all caught up</span>
              </div>
            ) : (
              items.map((n) => {
                const meta = KIND_META[n.kind] ?? KIND_META.system;
                const Icon = meta.Icon;
                const navigable = Boolean(n.link && LINK_TO_VIEW[n.link]);
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`app-notif-item${n.read ? "" : " is-unread"}${
                      navigable ? " is-nav" : ""
                    }`}
                    onClick={() => onItemClick(n)}
                  >
                    <span
                      className={`app-notif-icon tint-${meta.tint}`}
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="app-notif-body">
                      <span className="app-notif-item-title">{n.title}</span>
                      {n.body && (
                        <span className="app-notif-item-sub">{n.body}</span>
                      )}
                      <span className="app-notif-time">
                        {relativeTime(n.created_at)}
                      </span>
                    </span>
                    {!n.read && (
                      <span className="app-notif-dot" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
