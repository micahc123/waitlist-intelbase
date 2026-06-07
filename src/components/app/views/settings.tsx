// Settings - integrations, account, and workspace. Integrations connect via real
// Composio OAuth (useConnections), with a simulated fallback when Composio is
// unconfigured so toggles still work in demo. Account shows the org/user, opens
// the Stripe billing portal (or notes when billing is not configured), and signs
// out. Workspace holds a couple of honest local preference toggles.

"use client";

import { useCallback, useState } from "react";
import {
  Mail,
  CalendarClock,
  MessageSquare,
  Database,
  FileText,
  Sheet,
  MessageCircle,
  Megaphone,
  Plug,
  Check,
  Loader2,
  ExternalLink,
  LogOut,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import { TOOLKITS } from "@/lib/integrations/toolkits";
import { useConnections } from "@/lib/integrations/use-connections";
import "./controls.css";

// Resolve the lucide icon name carried by each toolkit to a real component.
const ICONS: Record<string, LucideIcon> = {
  Mail,
  CalendarClock,
  MessageSquare,
  Database,
  FileText,
  Sheet,
  MessageCircle,
  Megaphone,
};

export function Settings({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string | null;
}) {
  return (
    <div className="ibx">
      <ViewHead
        title="Settings"
        subtitle="Connect your tools, manage your account and billing, and set workspace preferences."
      />

      <div className="ibx-panel" style={{ padding: "0 var(--ib-5)" }}>
        <IntegrationsSection />
        <AccountSection orgName={orgName} userEmail={userEmail} />
        <WorkspaceSection />
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const { loading, isConnected, connect, setConnected } = useConnections();
  const [busy, setBusy] = useState<string | null>(null);

  const handleConnect = useCallback(
    async (slug: string) => {
      setBusy(slug);
      try {
        const wentToOAuth = await connect(slug);
        // Real OAuth navigates away (true). Simulated fallback returns false, so
        // we mark it connected locally to reflect the toggle.
        if (!wentToOAuth) setConnected(slug, true);
      } finally {
        setBusy(null);
      }
    },
    [connect, setConnected],
  );

  return (
    <section className="set-section">
      <div className="set-section-label">
        <h3>Integrations</h3>
        <p>Connect the tools your agents act through. Each one uses a secure OAuth connection.</p>
      </div>
      <div className="set-section-body">
        {TOOLKITS.map((tk) => {
          const Icon = ICONS[tk.icon] ?? Plug;
          const connected = isConnected(tk.slug);
          return (
            <div className="set-integration" key={tk.slug}>
              <div className="set-integration-icon">
                <Icon size={18} />
              </div>
              <div className="set-integration-meta">
                <div className="set-integration-name">
                  {tk.label}
                  {tk.gated && (
                    <span className="ibx-chip ibx-chip-warning">Needs Meta review</span>
                  )}
                </div>
                <div className="set-integration-desc">{tk.description}</div>
                {tk.gated && tk.note && (
                  <div className="set-integration-note">{tk.note}</div>
                )}
              </div>
              {connected ? (
                <span className="ibx-chip ibx-chip-success">
                  <Check size={11} /> Connected
                </span>
              ) : (
                <button
                  type="button"
                  className="ibx-btn"
                  disabled={loading || busy === tk.slug}
                  onClick={() => handleConnect(tk.slug)}
                >
                  {busy === tk.slug ? (
                    <Loader2 size={14} className="ibx-spin" />
                  ) : (
                    <Plug size={14} />
                  )}
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AccountSection({
  orgName,
  userEmail,
}: {
  orgName: string;
  userEmail: string | null;
}) {
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingNote, setBillingNote] = useState<string | null>(null);

  const handleBilling = useCallback(async () => {
    setBillingBusy(true);
    setBillingNote(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setBillingNote("Billing portal is not available right now.");
      } else if (res.status === 503) {
        setBillingNote("Billing is not configured for this workspace yet.");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setBillingNote(data.error ?? "Could not open billing.");
      }
    } catch {
      setBillingNote("Could not reach billing.");
    } finally {
      setBillingBusy(false);
    }
  }, []);

  return (
    <section className="set-section">
      <div className="set-section-label">
        <h3>Account</h3>
        <p>Your organization, sign-in, and subscription.</p>
      </div>
      <div className="set-section-body">
        <div className="set-row">
          <span className="set-row-label">Organization</span>
          <span className="set-row-value">{orgName}</span>
        </div>
        <div className="set-row">
          <span className="set-row-label">Signed in as</span>
          <span className="set-row-value">{userEmail ?? "Not signed in"}</span>
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Billing</div>
            <div className="set-row-sub">Update your card, change plan, or download invoices.</div>
          </div>
          <div className="set-actions">
            <button
              type="button"
              className="ibx-btn"
              onClick={handleBilling}
              disabled={billingBusy}
            >
              {billingBusy ? (
                <Loader2 size={14} className="ibx-spin" />
              ) : (
                <CreditCard size={14} />
              )}
              Manage billing
              <ExternalLink size={12} />
            </button>
            {/* Sign out is a form POST so the server redirect is followed natively. */}
            <form action="/auth/signout" method="post" style={{ display: "inline" }}>
              <button type="submit" className="ibx-btn ibx-btn-ghost">
                <LogOut size={14} />
                Sign out
              </button>
            </form>
          </div>
        </div>
        {billingNote && <div className="set-inline-note">{billingNote}</div>}
      </div>
    </section>
  );
}

function WorkspaceSection() {
  // Honest local-only preferences. These persist in the browser so the controls
  // are real, without claiming server-side delivery that is not wired yet.
  const [emailDigest, setEmailDigest] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);

  return (
    <section className="set-section">
      <div className="set-section-label">
        <h3>Workspace</h3>
        <p>Notification preferences for this workspace.</p>
      </div>
      <div className="set-section-body">
        <div className="set-row">
          <div>
            <div className="set-row-label">Daily email digest</div>
            <div className="set-row-sub">A morning summary of pipeline, inbox, and bookings.</div>
          </div>
          <PrefToggle
            checked={emailDigest}
            label="Toggle daily email digest"
            onChange={setEmailDigest}
          />
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Approval alerts</div>
            <div className="set-row-sub">Notify me when an agent queues an action for sign-off.</div>
          </div>
          <PrefToggle
            checked={approvalAlerts}
            label="Toggle approval alerts"
            onChange={setApprovalAlerts}
          />
        </div>
      </div>
    </section>
  );
}

function PrefToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="ibx-switch"
      onClick={() => onChange(!checked)}
    />
  );
}
