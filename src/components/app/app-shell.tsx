// The /app work shell - the REAL B2B product chrome. Fixed left Sidebar, a
// sticky Topbar, and a scrollable content area. View switching is local client
// state (no route per view); the active key selects which placeholder view to
// render. The cinematic command plane is NOT mounted here - it lives at its own
// route (/app/command), reached from the sidebar. No boot sequence here: this
// is a normal app, not a showpiece.
//
// Responsive behaviour (driven by CSS media queries in app.css plus the small
// amount of state below):
//   - desktop (>=1100px): fixed 240px sidebar, manually collapsible to a 64px
//     icon rail (preference persisted in localStorage).
//   - medium (768-1099px): sidebar is the icon rail by default.
//   - mobile (<768px): sidebar is hidden; the topbar hamburger opens it as an
//     overlay drawer with a scrim. Esc and scrim-click close it; focus is
//     trapped inside the drawer while open.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./app.css";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Overview } from "./views/overview";
import { Approvals } from "./views/approvals";
import { Inbox } from "./views/inbox";
import { Leads } from "./views/leads";
import { Agents } from "./views/agents";
import { Knowledge } from "./views/knowledge";
import { Settings } from "./views/settings";
import { Contacts } from "./views/contacts";
import { Tasks } from "./views/tasks";
import { CalendarView } from "./views/calendar";
import { Automations } from "./views/automations";
import { Insights } from "./views/insights";

export type ViewKey =
  | "overview"
  | "approvals"
  | "inbox"
  | "leads"
  | "agents"
  | "knowledge"
  | "settings"
  | "contacts"
  | "tasks"
  | "calendar"
  | "automations"
  | "insights";

const COLLAPSE_KEY = "ib.app.sidebarCollapsed";

export function AppShell({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string | null;
}) {
  const [active, setActive] = useState<ViewKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  // Restore the persisted collapse preference. With no stored preference, the
  // rail defaults to collapsed on medium viewports (768-1099px) so it lands as
  // an icon rail there; full width on larger screens.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored === "1" || stored === "0") {
        setCollapsed(stored === "1");
      } else if (typeof window !== "undefined" && window.matchMedia) {
        setCollapsed(window.matchMedia("(max-width: 1099px)").matches);
      }
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Switching views always dismisses the mobile drawer.
  const handleSelect = useCallback((key: ViewKey) => {
    setActive(key);
    setDrawerOpen(false);
  }, []);

  // Drawer: lock body scroll, close on Esc, trap focus, and restore focus to
  // the hamburger when it closes.
  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Move focus into the drawer.
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      hamburgerRef.current?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className={`app-shell ibx${collapsed ? " is-collapsed" : ""}`}>
      {/* Desktop / medium: persistent rail. */}
      <div className="app-sidebar-slot">
        <Sidebar
          active={active}
          onSelect={handleSelect}
          orgName={orgName}
          userEmail={userEmail}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile: overlay drawer. */}
      {drawerOpen && (
        <div className="app-drawer-root">
          <div
            className="app-drawer-scrim"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            className="app-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Primary navigation"
            ref={drawerRef}
          >
            <Sidebar
              active={active}
              onSelect={handleSelect}
              orgName={orgName}
              userEmail={userEmail}
              inDrawer
            />
            <button
              type="button"
              className="app-drawer-close ibx-btn"
              onClick={closeDrawer}
              aria-label="Close navigation"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="app-main">
        <Topbar
          active={active}
          orgName={orgName}
          onConnectTools={() => handleSelect("settings")}
          onNavigate={handleSelect}
          onOpenDrawer={() => setDrawerOpen(true)}
          hamburgerRef={hamburgerRef}
        />

        <main className="app-content">
          {active === "overview" && <Overview orgName={orgName} />}
          {active === "approvals" && <Approvals />}
          {active === "inbox" && <Inbox />}
          {active === "leads" && <Leads />}
          {active === "contacts" && <Contacts />}
          {active === "tasks" && <Tasks />}
          {active === "calendar" && <CalendarView />}
          {active === "agents" && <Agents />}
          {active === "automations" && <Automations />}
          {active === "knowledge" && <Knowledge />}
          {active === "insights" && <Insights />}
          {active === "settings" && <Settings orgName={orgName} userEmail={userEmail} />}
        </main>
      </div>
    </div>
  );
}
