// The persistent left navigation for the /app work shell. Primary nav switches
// views via client state (no route per view); "Command Center" is a real link
// out to the cinematic showpiece at /app/command. Bottom block carries Settings
// plus the org/user identity and a sign-out affordance (POST to /auth/signout).
//
// Responsive: at desktop it is a 240px rail with labels. At the medium
// breakpoint (or when the user collapses it) it shrinks to a ~64px icon rail
// (`is-collapsed`) - labels become hover/focus tooltips via title attributes
// and the org/user footer collapses to just the avatar. On mobile the same
// component renders inside an overlay drawer (see app-shell.tsx); there it is
// always expanded.

"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Inbox,
  Users,
  Bot,
  BookOpen,
  Settings,
  Orbit,
  LogOut,
  Contact2,
  ListChecks,
  Calendar,
  Workflow,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { ViewKey } from "./app-shell";

type NavItem = {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

const PRIMARY: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "approvals", label: "Approvals", icon: ShieldCheck },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "leads", label: "Leads", icon: Users },
  { key: "contacts", label: "Contacts", icon: Contact2 },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "agents", label: "Agents", icon: Bot },
  { key: "automations", label: "Automations", icon: Workflow },
  { key: "knowledge", label: "Knowledge", icon: BookOpen },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

function initials(orgName: string): string {
  const parts = orgName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({
  active,
  onSelect,
  orgName,
  userEmail,
  approvalsCount,
  collapsed = false,
  onToggleCollapse,
  inDrawer = false,
}: {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  orgName: string;
  userEmail: string | null;
  approvalsCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  inDrawer?: boolean;
}) {
  // Inside the mobile drawer the sidebar is always fully expanded.
  const isCollapsed = collapsed && !inDrawer;

  return (
    <aside className={`app-sidebar${isCollapsed ? " is-collapsed" : ""}`}>
      <div className="app-brand">
        <span className="app-brand-mark">
          <Orbit size={16} strokeWidth={2.2} />
        </span>
        <span className="app-brand-name">Intelbase</span>
      </div>

      <nav className="app-nav" aria-label="Primary">
        <span className="app-nav-label">Workspace</span>
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          const badge = item.key === "approvals" ? approvalsCount : item.badge;
          return (
            <button
              key={item.key}
              type="button"
              className={`app-nav-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(item.key)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="app-nav-item-icon" size={17} strokeWidth={2} />
              <span className="app-nav-label-text">{item.label}</span>
              {badge ? (
                <span className="app-nav-badge" aria-label={`${badge} pending`}>
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}

      </nav>

      <div className="app-sidebar-foot">
        <button
          type="button"
          className={`app-nav-item${active === "settings" ? " is-active" : ""}`}
          aria-current={active === "settings" ? "page" : undefined}
          onClick={() => onSelect("settings")}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="app-nav-item-icon" size={17} strokeWidth={2} />
          <span className="app-nav-label-text">Settings</span>
        </button>

        <div className="app-user">
          <span className="app-user-avatar" aria-hidden="true">
            {initials(orgName)}
          </span>
          <span className="app-user-meta">
            <span className="app-user-org" title={orgName}>
              {orgName}
            </span>
            <span className="app-user-email" title={userEmail ?? undefined}>
              {userEmail ?? "Not signed in"}
            </span>
          </span>
          <form action="/auth/signout" method="post" style={{ display: "contents" }}>
            <button type="submit" className="app-signout" aria-label="Sign out" title="Sign out">
              <LogOut size={15} strokeWidth={2} />
            </button>
          </form>
        </div>

        {onToggleCollapse ? (
          <button
            type="button"
            className="app-collapse-toggle"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isCollapsed}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={16} strokeWidth={2} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={2} />
            )}
            <span className="app-nav-label-text">Collapse</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
