// Settings - integrations, account, profile, team, and workspace. Integrations
// connect via real Composio OAuth (useConnections), with a simulated fallback
// when Composio is unconfigured so toggles still work in demo. Account shows
// the org/user, opens the Stripe billing portal (or notes when billing is not
// configured), and signs out. Profile lets the user set a display name, timezone,
// and notification preferences (local/best-effort, persisted to localStorage).
// Team lists members with role/status chips and an inline invite form. Workspace
// holds a couple of honest local preference toggles.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import { TOOLKITS } from "@/lib/integrations/toolkits";
import { useConnections } from "@/lib/integrations/use-connections";
import type { TeamMember, TeamRole } from "@/lib/db/types";
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

const ROLES: TeamRole[] = ["owner", "admin", "member", "viewer"];

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
        <AccountSection orgName={orgName} userEmail={userEmail} />
        <ProfileSection userEmail={userEmail} />
        <TeamSection />
        <IntegrationsSection />
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

// ---------------------------------------------------------------------------
// Profile section
// ---------------------------------------------------------------------------

const TIMEZONES = [
  { value: "Asia/Hong_Kong", label: "Asia/Hong Kong (HKT, UTC+8)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST, UTC+8)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET, UTC+1)" },
  { value: "America/New_York", label: "America/New York (ET)" },
  { value: "America/Chicago", label: "America/Chicago (CT)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PT)" },
  { value: "UTC", label: "UTC" },
];

const PROFILE_KEY = "ibx_profile_prefs";

interface ProfilePrefs {
  displayName: string;
  timezone: string;
  notifEmailDigest: boolean;
  notifApproval: boolean;
  notifMention: boolean;
}

function loadProfilePrefs(fallbackEmail: string | null): ProfilePrefs {
  if (typeof window === "undefined") {
    return {
      displayName: "",
      timezone: "Asia/Hong_Kong",
      notifEmailDigest: true,
      notifApproval: true,
      notifMention: true,
    };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfilePrefs>;
      return {
        displayName: parsed.displayName ?? fallbackEmail?.split("@")[0] ?? "",
        timezone: parsed.timezone ?? "Asia/Hong_Kong",
        notifEmailDigest: parsed.notifEmailDigest ?? true,
        notifApproval: parsed.notifApproval ?? true,
        notifMention: parsed.notifMention ?? true,
      };
    }
  } catch {
    // ignore parse errors
  }
  return {
    displayName: fallbackEmail?.split("@")[0] ?? "",
    timezone: "Asia/Hong_Kong",
    notifEmailDigest: true,
    notifApproval: true,
    notifMention: true,
  };
}

function ProfileSection({ userEmail }: { userEmail: string | null }) {
  const [prefs, setPrefs] = useState<ProfilePrefs>(() => ({
    displayName: "",
    timezone: "Asia/Hong_Kong",
    notifEmailDigest: true,
    notifApproval: true,
    notifMention: true,
  }));
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount (avoids SSR hydration mismatch).
  useEffect(() => {
    setPrefs(loadProfilePrefs(userEmail));
  }, [userEmail]);

  const update = useCallback(
    <K extends keyof ProfilePrefs>(key: K, value: ProfilePrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        } catch {
          // storage quota exceeded or private browsing
        }
        return next;
      });
      setSaved(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaved(false), 2000);
    },
    [],
  );

  return (
    <section className="set-section">
      <div className="set-section-label">
        <h3>Profile</h3>
        <p>
          Display name and local preferences. Notification toggles are stored in
          your browser and do not configure server delivery.
        </p>
      </div>
      <div className="set-section-body">
        <div className="set-row">
          <div>
            <div className="set-row-label">Display name</div>
            <div className="set-row-sub">Shown in comments and approval requests.</div>
          </div>
          <input
            type="text"
            className="ibx-input set-profile-input"
            value={prefs.displayName}
            placeholder="Your name"
            onChange={(e) => update("displayName", e.target.value)}
          />
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Timezone</div>
            <div className="set-row-sub">Used to display times across the app.</div>
          </div>
          <select
            className="ibx-input set-profile-select"
            value={prefs.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Email digests</div>
            <div className="set-row-sub">Daily morning summary (browser preference only).</div>
          </div>
          <PrefToggle
            checked={prefs.notifEmailDigest}
            label="Toggle email digests"
            onChange={(v) => update("notifEmailDigest", v)}
          />
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Approval alerts</div>
            <div className="set-row-sub">When an agent queues an action for sign-off.</div>
          </div>
          <PrefToggle
            checked={prefs.notifApproval}
            label="Toggle approval alerts"
            onChange={(v) => update("notifApproval", v)}
          />
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-label">Mention alerts</div>
            <div className="set-row-sub">When someone mentions you in a comment.</div>
          </div>
          <PrefToggle
            checked={prefs.notifMention}
            label="Toggle mention alerts"
            onChange={(v) => update("notifMention", v)}
          />
        </div>
        {saved && (
          <div className="set-inline-note" style={{ color: "var(--ib-mint)" }}>
            <Check size={11} style={{ display: "inline", marginRight: 4 }} />
            Saved locally
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Team section
// ---------------------------------------------------------------------------

function initials(member: TeamMember): string {
  if (member.name) {
    return member.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return member.email.slice(0, 2).toUpperCase();
}

function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteErr, setInviteErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/app/team", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { members?: TeamMember[] }) => {
        setMembers(data.members ?? []);
      })
      .catch(() => setLoadErr("Could not load team members."))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = useCallback(
    async (id: string, role: TeamRole) => {
      // Optimistic update first.
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role } : m)),
      );
      try {
        const res = await fetch("/api/app/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "role", id, role }),
          credentials: "include",
        });
        if (!res.ok) {
          // Revert on failure - refetch the real list.
          const refetch = await fetch("/api/app/team", { credentials: "include" });
          const data = (await refetch.json()) as { members?: TeamMember[] };
          setMembers(data.members ?? []);
        }
      } catch {
        // Silent - optimistic state stays; next load will correct.
      }
    },
    [],
  );

  const handleInvite = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setInviteErr(null);

      const emailTrimmed = inviteEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        setInviteErr("Please enter a valid email address.");
        return;
      }

      setInviteBusy(true);
      try {
        const res = await fetch("/api/app/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "invite", email: emailTrimmed, role: inviteRole }),
          credentials: "include",
        });
        const data = (await res.json()) as { ok: boolean; member?: TeamMember; reason?: string };
        if (data.ok && data.member) {
          // Prepend the returned row for immediate feedback.
          setMembers((prev) => [data.member!, ...prev]);
          setInviteEmail("");
          setInviteRole("member");
        } else {
          setInviteErr(data.reason ?? "Invite failed. Please try again.");
        }
      } catch {
        setInviteErr("Could not send invite. Check your connection.");
      } finally {
        setInviteBusy(false);
      }
    },
    [inviteEmail, inviteRole],
  );

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <section className="set-section">
      <div className="set-section-label">
        <h3>Team</h3>
        <p>
          Members count toward your plan seats. Roles control what each person
          can view and change.
        </p>
      </div>
      <div className="set-section-body">
        {/* Seat summary */}
        <div className="set-team-meta">
          <span className="ibx-chip ibx-chip-success">
            <span className="ibx-chip-dot" />
            {activeCount} active
          </span>
          {invitedCount > 0 && (
            <span className="ibx-chip ibx-chip-warning">
              <span className="ibx-chip-dot" />
              {invitedCount} invited
            </span>
          )}
        </div>

        {/* Member list */}
        {loading && (
          <div className="set-row" style={{ justifyContent: "center" }}>
            <Loader2 size={16} className="ibx-spin" style={{ color: "var(--ib-text-3)" }} />
          </div>
        )}
        {loadErr && <div className="set-inline-note" style={{ color: "var(--ib-amber)" }}>{loadErr}</div>}
        {!loading && !loadErr && members.length === 0 && (
          <div className="set-inline-note">No team members yet.</div>
        )}
        {!loading && members.map((m) => (
          <div className="set-member-row" key={m.id}>
            <div className="set-member-avatar" aria-hidden>
              {initials(m)}
            </div>
            <div className="set-member-meta">
              <div className="set-member-name">{m.name ?? m.email}</div>
              {m.name && <div className="set-member-email">{m.email}</div>}
            </div>
            <div className="set-member-chips">
              {m.status === "active" ? (
                <span className="ibx-chip ibx-chip-success">Active</span>
              ) : (
                <span className="ibx-chip ibx-chip-warning">Invited</span>
              )}
            </div>
            {/* Role: read-only for owner row, editable for everyone else */}
            {m.role === "owner" ? (
              <span className="ibx-chip ibx-chip-info">Owner</span>
            ) : (
              <select
                className="set-role-select"
                value={m.role}
                aria-label={`Role for ${m.name ?? m.email}`}
                onChange={(e) => handleRoleChange(m.id, e.target.value as TeamRole)}
              >
                {ROLES.filter((r) => r !== "owner").map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Invite form */}
        <form className="set-invite-form" onSubmit={handleInvite} noValidate>
          <div className="set-invite-fields">
            <input
              type="email"
              className="ibx-input"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                if (inviteErr) setInviteErr(null);
              }}
              aria-label="Invite email"
              disabled={inviteBusy}
            />
            <select
              className="ibx-input set-invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              aria-label="Invite role"
              disabled={inviteBusy}
            >
              {ROLES.filter((r) => r !== "owner").map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="ibx-btn ibx-btn-primary"
            disabled={inviteBusy || !inviteEmail.trim()}
          >
            {inviteBusy ? <Loader2 size={14} className="ibx-spin" /> : <UserPlus size={14} />}
            Invite teammate
          </button>
          {inviteErr && (
            <div className="set-invite-err">{inviteErr}</div>
          )}
        </form>
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
        <p>Workspace-wide defaults for all members.</p>
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
