// Settings - workspace, integrations, and account configuration. Placeholder
// empty state; the data layer wires the real settings panels next. The topbar
// "Connect tools" action and the sidebar Settings item both land here.

import { Settings as SettingsIcon } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

export function Settings({ orgName, userEmail }: { orgName: string; userEmail: string | null }) {
  return (
    <div className="ibx">
      <ViewHead
        title="Settings"
        subtitle="Workspace, integrations, and account."
      />

      <div className="ibx-panel" style={{ marginBottom: "var(--ib-4)" }}>
        <div className="ibx-panel-head">
          <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>Workspace</span>
        </div>
        <div style={{ padding: "var(--ib-4)", display: "grid", gap: "var(--ib-3)" }}>
          <Row label="Organization" value={orgName} />
          <Row label="Signed in as" value={userEmail ?? "Not signed in"} />
        </div>
      </div>

      <EmptyPanel
        icon={<SettingsIcon size={22} />}
        title="This is where integrations and configuration live"
        body="Connect your channels, configure agent guardrails, manage billing, and invite teammates here."
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--ib-4)" }}>
      <span style={{ fontSize: "var(--ib-fs-sm)", color: "var(--ib-text-3)" }}>{label}</span>
      <span style={{ fontSize: "var(--ib-fs-sm)", color: "var(--ib-text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
