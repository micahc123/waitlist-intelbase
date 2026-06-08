"use client";

// The Intelbase onboarding wizard. A centered, premium 4-step flow:
//   1. Business   -> name + optional "what do you do" (saveBusiness)
//   2. Connect    -> 6 connector cards (real OAuth when Composio configured,
//                   honest "needs API key" note when not; no fake connections)
//   3. Goals      -> multi-select chips (local only)
//   4. Plan       -> 3 plans + monthly/annual toggle + start 14-day trial
//
// Resilience: when billing/Supabase env is missing, the server actions are
// safe no-ops and the plan step falls back to completeOnboarding() + navigate
// to /app. The wizard never crashes in a logged-out/dev state.
// Connect step: saveConnections is only called with slugs that are genuinely
// connected (real OAuth round-trip completed). No fake/simulated rows are
// written to the connections table.

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Megaphone,
  CalendarClock,
  Database,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { CONNECTORS, GOALS, type ConnectorAccent } from "@/lib/onboarding";
import { PLAN_LIST, type BillingInterval, type PlanId } from "@/lib/stripe-plans";
import { saveBusiness, saveConnections, completeOnboarding } from "@/app/onboarding/actions";
import { toolkitForConnector, TOOLKITS_BY_SLUG } from "@/lib/integrations/toolkits";
import { useConnections } from "@/lib/integrations/use-connections";
import "./onboarding.css";

const ICONS: Record<string, LucideIcon> = {
  MessageSquare,
  MessageCircle,
  Mail,
  Megaphone,
  CalendarClock,
  Database,
};

const ACCENT_VAR: Record<ConnectorAccent, string> = {
  blue: "var(--ob-blue)",
  mint: "var(--ob-mint)",
  violet: "var(--ob-violet)",
  amber: "var(--ob-amber)",
  pink: "var(--ob-pink)",
};

const TOTAL_STEPS = 4;

const STEP_VARIANTS = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const PLAN_ACCENT: Record<PlanId, ConnectorAccent> = {
  starter: "blue",
  growth: "mint",
  scale: "violet",
};

export function Onboarding({
  initialName,
  userEmail,
}: {
  initialName: string;
  userEmail: string | null;
}) {
  const [step, setStep] = useState(0);

  // Step 1
  const [name, setName] = useState(initialName);
  const [what, setWhat] = useState("");

  // Step 2 - only tracks slugs that completed a real OAuth round-trip.
  const [connected, setConnected] = useState<Set<string>>(new Set());

  // Step 3
  const [goals, setGoals] = useState<Set<string>>(new Set());

  // Step 4
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [starting, setStarting] = useState<PlanId | null>(null);
  const [statusNote, setStatusNote] = useState<string>("");

  const [busy, setBusy] = useState(false);

  const { loading: connLoading, configured: composioConfigured, isConnected: realIsConnected, connect: realConnect } = useConnections();

  // Once the status fetch resolves, seed local `connected` with whatever the
  // server already knows (e.g. the user returning after an OAuth round-trip).
  useEffect(() => {
    if (connLoading) return;
    setConnected((prev) => {
      const next = new Set(prev);
      for (const c of CONNECTORS) {
        const slug = toolkitForConnector(c.id);
        if (slug && realIsConnected(slug)) next.add(c.id);
      }
      return next;
    });
    // Only run once when loading transitions to false.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connLoading]);

  async function toggleConnector(id: string) {
    const slug = toolkitForConnector(id);

    // If already connected (real), allow toggling off locally.
    if (connected.has(id)) {
      setConnected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    // No slug (e.g. website-chat without toolkit): not connectable.
    if (!slug) return;

    // Composio not configured: do nothing (button is disabled, but guard here too).
    if (!composioConfigured) return;

    // Attempt real OAuth redirect. Browser navigates away on success.
    const result = await realConnect(slug);
    if (result === "redirecting") {
      // Browser will navigate away; mark pending in local state to give feedback.
      setConnected((prev) => new Set([...prev, id]));
    }
    // "unconfigured" or "error": do not fake a connected state.
  }

  function toggleGoal(id: string) {
    setGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function goNext() {
    if (busy) return;
    setBusy(true);
    try {
      if (step === 0) {
        await saveBusiness(name);
      } else if (step === 1) {
        // Only persist connections that completed a real OAuth round-trip.
        // When connected is empty (Composio unconfigured or user skipped),
        // saveConnections is skipped entirely to avoid writing fake rows.
        if (connected.size > 0) {
          await saveConnections([...connected]);
        }
      }
    } catch {
      // Actions never throw, but stay defensive.
    } finally {
      setBusy(false);
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    if (busy) return;
    setStep((s) => Math.max(s - 1, 0));
  }

  async function startTrial(plan: PlanId) {
    if (starting) return;
    setStarting(plan);
    setStatusNote("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Billing not configured (503), or no URL came back: dev/preview path.
      setStatusNote("Starting your workspace...");
      await completeOnboarding();
      window.location.href = "/app";
    } catch {
      // Network/other failure: still get the user into the app.
      setStatusNote("Starting your workspace...");
      await completeOnboarding();
      window.location.href = "/app";
    }
  }

  const canContinue = step === 0 ? name.trim().length > 0 : true;

  return (
    <div className="ob-root">
      <div className="ob-bg" aria-hidden />
      <div className="ob-shell">
        <header className="ob-head">
          <div className="ob-brand">
            <span className="ob-brand-mark">
              <Sparkles size={16} strokeWidth={2.4} />
            </span>
            <span className="ob-brand-name">intelbase</span>
          </div>
          <p className="ob-welcome">
            Welcome to Intelbase{userEmail ? `, ${userEmail}` : ""}.
          </p>
          <div className="ob-progress">
            <span className="ob-progress-label">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <div className="ob-progress-track">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={`ob-progress-dot ${i <= step ? "is-on" : ""}`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="ob-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="ob-step"
            >
              {step === 0 && (
                <StepBusiness
                  name={name}
                  setName={setName}
                  what={what}
                  setWhat={setWhat}
                />
              )}
              {step === 1 && (
                <StepConnect
                  connected={connected}
                  toggle={toggleConnector}
                  connLoading={connLoading}
                  configured={composioConfigured}
                />
              )}
              {step === 2 && (
                <StepGoals goals={goals} toggle={toggleGoal} />
              )}
              {step === 3 && (
                <StepPlan
                  interval={interval}
                  setInterval={setInterval}
                  starting={starting}
                  statusNote={statusNote}
                  onStart={startTrial}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < TOTAL_STEPS - 1 && (
          <footer className="ob-foot">
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              onClick={goBack}
              disabled={step === 0 || busy}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={goNext}
              disabled={!canContinue || busy}
            >
              {busy ? "Saving..." : "Continue"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </footer>
        )}

        {step === TOTAL_STEPS - 1 && (
          <footer className="ob-foot">
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              onClick={goBack}
              disabled={!!starting}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <span className="ob-foot-note">14-day free trial. Cancel anytime.</span>
          </footer>
        )}
      </div>
    </div>
  );
}

function StepBusiness({
  name,
  setName,
  what,
  setWhat,
}: {
  name: string;
  setName: (v: string) => void;
  what: string;
  setWhat: (v: string) => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">What is your business called?</h1>
      <p className="ob-sub">
        We will use this to set up your workspace.
      </p>
      <div className="ob-field">
        <label className="ob-label" htmlFor="ob-name">
          Business name
        </label>
        <input
          id="ob-name"
          className="ob-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Studio"
          autoFocus
          autoComplete="organization"
        />
      </div>
      <div className="ob-field">
        <label className="ob-label" htmlFor="ob-what">
          What do you do? <span className="ob-optional">optional</span>
        </label>
        <input
          id="ob-what"
          className="ob-input"
          type="text"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="e.g. We help dentists get more patients"
        />
      </div>
    </div>
  );
}

function StepConnect({
  connected,
  toggle,
  connLoading,
  configured,
}: {
  connected: Set<string>;
  toggle: (id: string) => void;
  connLoading: boolean;
  configured: boolean;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">Connect your tools</h1>
      <p className="ob-sub">
        {configured
          ? "Connect now or skip - you can change this anytime in Settings."
          : "You can connect your tools later in Settings once your workspace is set up."}
      </p>
      {!connLoading && !configured && (
        <div className="ob-unconfigured-note">
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          Connecting requires a Composio API key. Add{" "}
          <code>COMPOSIO_API_KEY</code> to enable real connections.
        </div>
      )}
      <div className="ob-grid">
        {CONNECTORS.map((c) => {
          const Icon = ICONS[c.icon] ?? MessageSquare;
          const on = connected.has(c.id);
          const accent = ACCENT_VAR[c.accent];
          const slug = toolkitForConnector(c.id);
          const toolkit = slug ? TOOLKITS_BY_SLUG[slug] : null;
          const gated = toolkit?.gated ?? false;
          const gatedNote = toolkit?.note ?? null;
          // A card is actionable only when Composio is configured and the
          // toolkit has a slug. Cards with no slug (website-chat) are shown
          // but not clickable (never had real connect).
          const canConnect = configured && slug !== null && !gated;
          const isDisabled = connLoading || !canConnect;
          return (
            <button
              key={c.id}
              type="button"
              className={`ob-card ${on ? "is-on" : ""} ${isDisabled && !on ? "is-disabled" : ""}`}
              style={{ ["--card-accent" as string]: accent }}
              onClick={() => { if (!isDisabled) void toggle(c.id); }}
              disabled={isDisabled && !on}
              aria-pressed={on}
            >
              <span className="ob-card-icon">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="ob-card-body">
                <span className="ob-card-label">
                  {c.label}
                </span>
                <span className="ob-card-desc">{c.description}</span>
                {gated && gatedNote && (
                  <span className="ob-card-gated-note">{gatedNote}</span>
                )}
              </span>
              <span className="ob-card-state">
                {on ? (
                  <span className="ob-card-connected">
                    <Check size={14} strokeWidth={3} /> Connected
                  </span>
                ) : (
                  <span className="ob-card-connect">
                    {!configured ? "Needs setup" : gated ? "Needs review" : "Connect"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepGoals({
  goals,
  toggle,
}: {
  goals: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">What should Intelbase focus on?</h1>
      <p className="ob-sub">Pick as many as you like.</p>
      <div className="ob-chips">
        {GOALS.map((g) => {
          const on = goals.has(g.id);
          return (
            <button
              key={g.id}
              type="button"
              className={`ob-chip ${on ? "is-on" : ""}`}
              onClick={() => toggle(g.id)}
              aria-pressed={on}
            >
              {on && <Check size={14} strokeWidth={3} />}
              {g.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPlan({
  interval,
  setInterval,
  starting,
  statusNote,
  onStart,
}: {
  interval: BillingInterval;
  setInterval: (v: BillingInterval) => void;
  starting: PlanId | null;
  statusNote: string;
  onStart: (plan: PlanId) => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">Start your 14-day free trial</h1>
      <p className="ob-sub">No charge today. Pick a plan to get started.</p>

      <div className="ob-toggle" role="tablist" aria-label="Billing interval">
        <button
          type="button"
          role="tab"
          aria-selected={interval === "monthly"}
          className={`ob-toggle-opt ${interval === "monthly" ? "is-on" : ""}`}
          onClick={() => setInterval("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={interval === "annual"}
          className={`ob-toggle-opt ${interval === "annual" ? "is-on" : ""}`}
          onClick={() => setInterval("annual")}
        >
          Annual <span className="ob-toggle-save">2 months free</span>
        </button>
      </div>

      <div className="ob-plans">
        {PLAN_LIST.map((p) => {
          const accent = ACCENT_VAR[PLAN_ACCENT[p.id]];
          const price = interval === "annual" ? p.priceAnnual : p.priceMonthly;
          const unit = interval === "annual" ? "/yr" : "/mo";
          const featured = p.id === "growth";
          const isStarting = starting === p.id;
          return (
            <div
              key={p.id}
              className={`ob-plan ${featured ? "is-featured" : ""}`}
              style={{ ["--plan-accent" as string]: accent }}
            >
              {featured && <span className="ob-plan-tag">Most popular</span>}
              <h2 className="ob-plan-name">{p.name}</h2>
              <div className="ob-plan-price">
                <span className="ob-plan-amount">${price}</span>
                <span className="ob-plan-unit">{unit}</span>
              </div>
              <button
                type="button"
                className="ob-btn ob-btn-plan"
                onClick={() => onStart(p.id)}
                disabled={!!starting}
              >
                {isStarting ? "Starting..." : "Start 14-day free trial"}
              </button>
            </div>
          );
        })}
      </div>

      {statusNote && <p className="ob-status">{statusNote}</p>}
    </div>
  );
}
