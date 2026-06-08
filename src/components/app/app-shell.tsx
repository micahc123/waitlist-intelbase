// The /app work shell - the REAL B2B product chrome. Fixed left Sidebar, a
// sticky Topbar, and a scrollable content area. View switching is local client
// state (no route per view); the active key selects which placeholder view to
// render. The cinematic command plane is NOT mounted here - it lives at its own
// route (/app/command), reached from the sidebar. No boot sequence here: this
// is a normal app, not a showpiece.

"use client";

import { useState } from "react";
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

export function AppShell({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string | null;
}) {
  const [active, setActive] = useState<ViewKey>("overview");

  return (
    <div className="app-shell ibx">
      <Sidebar
        active={active}
        onSelect={setActive}
        orgName={orgName}
        userEmail={userEmail}
      />

      <div className="app-main">
        <Topbar
          active={active}
          orgName={orgName}
          onConnectTools={() => setActive("settings")}
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
