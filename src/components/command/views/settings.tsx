"use client";

import { useState } from "react";
import * as Lucide from "lucide-react";
import { useSim } from "@/lib/command/use-sim";
import { TOOLKITS } from "@/lib/integrations/toolkits";
import { useConnections } from "@/lib/integrations/use-connections";
import "./settings.css";

function Switch({ on, onClick, accent = "#6ea8ff" }: { on: boolean; onClick: () => void; accent?: string }) {
  return (
    <button
      type="button"
      className="st-switch"
      data-on={on}
      style={{ ["--ac" as string]: accent }}
      onClick={onClick}
      aria-pressed={on}
    >
      <span className="st-switch-knob" />
    </button>
  );
}

function Section({
  icon,
  title,
  tag,
  children,
}: {
  icon: string;
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  const ICONS = Lucide as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>;
  const C = ICONS[icon] ?? Lucide.Circle;
  return (
    <section className="st-section">
      <div className="st-sec-head">
        <span className="st-sec-icon">
          <C size={15} strokeWidth={1.7} />
        </span>
        <span className="st-sec-title">{title}</span>
        {tag && <span className="st-sec-tag">{tag}</span>}
      </div>
      {children}
    </section>
  );
}

const ACCENTS = [
  { id: "blue", color: "#6ea8ff" },
  { id: "mint", color: "#7df5c8" },
  { id: "violet", color: "#b79cff" },
  { id: "amber", color: "#ffb86b" },
  { id: "pink", color: "#ff8fb1" },
];

// Integrations section: lists all known TOOLKITS with real connect/status.
// Fetches from /api/integrations/status on mount; falls back to simulated
// toggle on 503 or any network failure.
function IntegrationsSection() {
  const ICONS = Lucide as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>;

  const { loading, isConnected, connect } = useConnections();

  // Track which slugs are currently in-flight (showing "Connecting...").
  const [busy, setBusy] = useState<Set<string>>(new Set());

  async function handleConnect(slug: string) {
    if (busy.has(slug) || isConnected(slug)) return;
    setBusy((prev) => new Set([...prev, slug]));
    try {
      // Real connect: redirects to OAuth when Composio is configured, otherwise
      // a no-op (no fake connected state).
      await connect(slug);
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  }

  return (
    <Section icon="Plug" title="Integrations" tag="connect">
      {loading ? (
        <div className="st-int-loading">Loading status...</div>
      ) : (
        <div className="st-int-list">
          {TOOLKITS.map((tk) => {
            const C = ICONS[tk.icon] ?? Lucide.Circle;
            const connected = isConnected(tk.slug);
            const inFlight = busy.has(tk.slug);
            return (
              <div key={tk.slug} className="st-row">
                <span className="st-int-icon">
                  <C size={15} strokeWidth={1.7} />
                </span>
                <div className="st-row-id">
                  <div className="st-row-label">
                    {tk.label}
                    {tk.gated && (
                      <span className="st-int-gated-tag">needs Meta verification</span>
                    )}
                  </div>
                  <div className="st-row-desc">{tk.description}</div>
                </div>
                <button
                  type="button"
                  className={`st-int-btn ${connected ? "st-int-btn--on" : ""}`}
                  onClick={() => { void handleConnect(tk.slug); }}
                  disabled={inFlight}
                  aria-pressed={connected}
                >
                  {inFlight
                    ? "Connecting..."
                    : connected
                    ? "Connected"
                    : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// Initials for the account avatar, derived from the workspace name.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Settings() {
  const { paused, setPaused, speed, setSpeed, orgName, userEmail } = useSim();

  // Account / billing action state.
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingNote, setBillingNote] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Open the Stripe Customer Portal. 503/unconfigured -> friendly inline note.
  async function manageBilling() {
    if (billingBusy) return;
    setBillingBusy(true);
    setBillingNote(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { url?: string } | null;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        setBillingNote("Billing opens once your subscription is active");
      } else {
        setBillingNote("Billing opens once your subscription is active");
      }
    } catch {
      setBillingNote("Billing opens once your subscription is active");
    } finally {
      setBillingBusy(false);
    }
  }

  // Sign out via the existing POST endpoint, then land back home.
  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const res = await fetch("/auth/signout", { method: "POST" });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  }

  // visual-only local toggles (cosmetic, do not affect shared sim)
  const [bloom, setBloom] = useState(true);
  const [particles, setParticles] = useState(true);
  const [labels, setLabels] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoFocus, setAutoFocus] = useState(true);
  const [feedSound, setFeedSound] = useState(false);
  const [accent, setAccent] = useState("blue");

  const accentColor = ACCENTS.find((a) => a.id === accent)?.color ?? "#6ea8ff";

  return (
    <div className="st-root">
      <div className="st-head">
        <span className="st-head-mark">
          <Lucide.SlidersHorizontal size={22} strokeWidth={1.6} />
        </span>
        <div>
          <div className="st-title">Director Controls</div>
          <div className="st-sub">Tune the sim before recording</div>
        </div>
      </div>

      <div className="st-cols">
        {/* LEFT COLUMN */}
        <div>
          <Section icon="Activity" title="Simulation" tag="live">
            <button
              type="button"
              className="st-pause"
              data-running={!paused}
              onClick={() => setPaused(!paused)}
            >
              <span className="st-pause-ic">
                {paused ? <Lucide.Play size={20} strokeWidth={1.7} /> : <Lucide.Pause size={20} strokeWidth={1.7} />}
              </span>
              <span className="st-pause-id">
                <span className="st-pause-state">{paused ? "Paused" : "Running"}</span>
                <span className="st-pause-hint">{paused ? "Click to resume the simulation" : "Click to freeze every agent"}</span>
              </span>
              <span className="st-pause-led">
                <span className="st-pause-led-dot" />
                {paused ? "halted" : "active"}
              </span>
            </button>

            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Simulation speed</div>
                <div className="st-row-desc">Time multiplier for the whole plane</div>
              </div>
              <div className="st-seg" style={{ ["--ac" as string]: accentColor }}>
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="st-seg-btn"
                    data-on={speed === s}
                    onClick={() => setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section icon="Sparkles" title="Visuals" tag="cosmetic">
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Bloom intensity</div>
                <div className="st-row-desc">Neon glow around live nodes</div>
              </div>
              <Switch on={bloom} onClick={() => setBloom((v) => !v)} accent={accentColor} />
            </div>
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Particles</div>
                <div className="st-row-desc">Ambient data motes in the field</div>
              </div>
              <Switch on={particles} onClick={() => setParticles((v) => !v)} accent={accentColor} />
            </div>
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Node labels</div>
                <div className="st-row-desc">Show names on the constellation</div>
              </div>
              <Switch on={labels} onClick={() => setLabels((v) => !v)} accent={accentColor} />
            </div>
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Reduced motion</div>
                <div className="st-row-desc">Calm transitions for capture</div>
              </div>
              <Switch on={reducedMotion} onClick={() => setReducedMotion((v) => !v)} accent={accentColor} />
            </div>
          </Section>

          <Section icon="Palette" title="Theme" tag="accent">
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Accent color</div>
                <div className="st-row-desc">Primary highlight across the HUD</div>
              </div>
              <div className="st-accents">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="st-accent"
                    data-on={accent === a.id}
                    style={{ background: a.color, color: a.color }}
                    onClick={() => setAccent(a.id)}
                    aria-label={a.id}
                  />
                ))}
              </div>
            </div>
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Base palette</div>
                <div className="st-row-desc">Near-black Jarvis HUD</div>
              </div>
              <div className="st-seg" style={{ ["--ac" as string]: accentColor }}>
                <button type="button" className="st-seg-btn" data-on={true}>
                  Midnight
                </button>
                <button type="button" className="st-seg-btn" data-on={false}>
                  Obsidian
                </button>
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <IntegrationsSection />

          <Section icon="UserCircle2" title="Account" tag="signed in">
            <div className="st-profile">
              <span className="st-pf-ava">{initials(orgName)}</span>
              <div className="st-pf-id">
                <div className="st-pf-name">{orgName}</div>
                <div className="st-pf-mail">{userEmail ?? "Not signed in"}</div>
              </div>
            </div>
            <div className="st-pf-ws">
              <div>
                <div className="st-pf-ws-k">Workspace</div>
                <div className="st-pf-ws-v">{orgName}</div>
              </div>
              <div>
                <div className="st-pf-ws-k">Plan</div>
                <div className="st-pf-ws-v">Command / Pro</div>
              </div>
            </div>

            <div className="st-acct-actions">
              <button
                type="button"
                className="st-acct-btn st-acct-btn--primary"
                onClick={() => void manageBilling()}
                disabled={billingBusy}
              >
                <Lucide.CreditCard size={15} strokeWidth={1.8} />
                {billingBusy ? "Opening billing..." : "Manage billing"}
              </button>
              <button
                type="button"
                className="st-acct-btn"
                onClick={() => void signOut()}
                disabled={signingOut}
              >
                <Lucide.LogOut size={15} strokeWidth={1.8} />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>

            {billingNote && (
              <div className="st-note" style={{ marginTop: 12 }}>
                <span className="st-note-ic" style={{ color: "#6ea8ff" }}>
                  <Lucide.Info size={16} strokeWidth={1.7} />
                </span>
                <span className="st-note-txt">{billingNote}</span>
              </div>
            )}
          </Section>

          <Section icon="Bell" title="Capture preferences" tag="cosmetic">
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Auto-focus firing nodes</div>
                <div className="st-row-desc">Camera drifts toward live events</div>
              </div>
              <Switch on={autoFocus} onClick={() => setAutoFocus((v) => !v)} accent={accentColor} />
            </div>
            <div className="st-row">
              <div className="st-row-id">
                <div className="st-row-label">Feed sound cues</div>
                <div className="st-row-desc">Subtle ping on new events</div>
              </div>
              <Switch on={feedSound} onClick={() => setFeedSound((v) => !v)} accent={accentColor} />
            </div>
          </Section>

          <Section icon="RotateCcw" title="Boot and reset">
            <div className="st-note">
              <span className="st-note-ic">
                <Lucide.Info size={16} strokeWidth={1.7} />
              </span>
              <span className="st-note-txt">
                <b>Replay boot</b> available from the <kbd>⟲</kbd> button bottom-right. Re-runs the cinematic
                power-on sequence for a fresh take.
              </span>
            </div>
            <div className="st-note" style={{ marginTop: 10 }}>
              <span className="st-note-ic" style={{ color: "#6ea8ff" }}>
                <Lucide.Command size={16} strokeWidth={1.7} />
              </span>
              <span className="st-note-txt">
                Press <kbd>⌘K</kbd> for the command palette, <kbd>1</kbd>-<kbd>6</kbd> to switch views.
              </span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
