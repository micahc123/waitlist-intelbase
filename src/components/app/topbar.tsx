// The work-shell top bar: a mobile hamburger (opens the nav drawer), the
// current view title + subtitle on the left, a working global search launcher
// (Cmd/Ctrl-K), a notifications bell, a "Connect tools" action that jumps to
// Settings/integrations, and the user avatar on the right. Calm by design - the
// data density lives in the views, not the chrome. Under ~640px the search
// launcher collapses to an icon (CSS) and "Connect tools" hides its label.

"use client";

import type { RefObject } from "react";
import { Plug, Menu } from "lucide-react";
import type { ViewKey } from "./app-shell";
import { GlobalSearch } from "./global-search";
import { Notifications } from "./notifications";

const TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "What your AI operating system is doing right now" },
  approvals: { title: "Approvals", subtitle: "Actions waiting for your sign-off" },
  inbox: { title: "Inbox", subtitle: "Every conversation, unified" },
  leads: { title: "Leads", subtitle: "Contacts and pipeline" },
  contacts: { title: "Contacts", subtitle: "Everyone your business deals with" },
  tasks: { title: "Tasks", subtitle: "Your work and what your agents queue" },
  calendar: { title: "Calendar", subtitle: "Bookings and appointments by week" },
  agents: { title: "Agents", subtitle: "Your automations and their runs" },
  automations: { title: "Automations", subtitle: "The rules that run your business" },
  knowledge: { title: "Knowledge", subtitle: "The brain your agents draw on" },
  insights: { title: "Insights", subtitle: "Pipeline, conversion, and agent activity" },
  settings: { title: "Settings", subtitle: "Workspace, integrations, and account" },
};

function avatarInitials(orgName: string): string {
  const parts = orgName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Topbar({
  active,
  orgName,
  onConnectTools,
  onNavigate,
  onOpenDrawer,
  hamburgerRef,
}: {
  active: ViewKey;
  orgName: string;
  onConnectTools: () => void;
  onNavigate: (view: ViewKey) => void;
  onOpenDrawer?: () => void;
  hamburgerRef?: RefObject<HTMLButtonElement | null>;
}) {
  const meta = TITLES[active];
  return (
    <header className="app-topbar">
      <button
        type="button"
        className="app-hamburger"
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        ref={hamburgerRef}
      >
        <Menu size={18} strokeWidth={2} />
      </button>

      <div className="app-topbar-title">
        <h1>{meta.title}</h1>
        <div className="app-topbar-sub">{meta.subtitle}</div>
      </div>

      <div className="app-topbar-search">
        <GlobalSearch onNavigate={onNavigate} />
      </div>

      <div className="app-topbar-spacer" />

      <div className="app-topbar-actions">
        <Notifications onNavigate={onNavigate} />
        <button
          type="button"
          className="ibx-btn app-connect-btn"
          onClick={onConnectTools}
        >
          <Plug size={15} strokeWidth={2} />
          <span className="app-connect-label">Connect tools</span>
        </button>
        <span className="app-topbar-avatar" aria-hidden="true">
          {avatarInitials(orgName)}
        </span>
      </div>
    </header>
  );
}
