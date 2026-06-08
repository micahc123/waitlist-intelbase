"use client";

// The Intelbase onboarding wizard. A centered, premium post-login setup flow:
//   1. Welcome    -> welcoming intro + Get started
//   2. Workspace  -> name your workspace + what your business does (saveBusiness)
//   3. Focus      -> what Intelbase should focus on first (multi-select, local)
//   4. Plan       -> 3 plans + monthly/annual toggle + start 14-day trial
//   5. Connect    -> connect your tools (real OAuth when Composio configured,
//                   honest "needs API key" note when not; no fake connections)
//   6. Finish     -> "You are all set" + completeOnboarding() -> /app
//
// Resilience: when billing/Supabase/Composio env is missing, the server actions
// are safe no-ops and every step is skippable. The wizard never crashes in a
// logged-out/dev state and never throws.
//
// Onboarded gating: completeOnboarding() runs before navigating to /app so the
// /app gate lets the user in. If the user starts a Stripe checkout (redirects
// away), the Plan step calls completeOnboarding() FIRST so that when Stripe's
// success_url returns them to /app they are already marked onboarded.

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

// Step indices for readability.
const STEP_WELCOME = 0;
const STEP_WORKSPACE = 1;
const STEP_FOCUS = 2;
const STEP_PLAN = 3;
const STEP_CONNECT = 4;
const STEP_FINISH = 5;
const TOTAL_STEPS = 6;

// The progress indicator counts the setup steps (Workspace..Finish). The
// Welcome screen is an intro and is not counted, so the bar starts on Workspace.
const PROGRESS_STEPS = TOTAL_STEPS - 1; // 5 numbered setup steps

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

// A few business-type chips for the Workspace step. Local state only.
const BUSINESS_TYPES = [
  "Clinic",
  "Agency",
  "Ecommerce",
  "Services",
  "Other",
];

export function Onboarding({
  initialName,
  userEmail,
}: {
  initialName: string;
  userEmail: string | null;
}) {
  const [step, setStep] = useState(STEP_WELCOME);

  // Workspace
  const [name, setName] = useState(initialName);
  const [bizType, setBizType] = useState<string>("");

  // Focus (local only)
  const [goals, setGoals] = useState<Set<string>>(new Set());

  // Plan
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [starting, setStarting] = useState<PlanId | null>(null);
  const [statusNote, setStatusNote] = useState<string>("");

  // Connect - only tracks slugs that completed a real OAuth round-trip.
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const {
    loading: connLoading,
    configured: composioConfigured,
    isConnected: realIsConnected,
    connect: realConnect,
  } = useConnections();

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
      if (step === STEP_WORKSPACE) {
        await saveBusiness(name);
      } else if (step === STEP_CONNECT) {
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
    if (busy || finishing) return;
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
          // Mark onboarded BEFORE leaving for Stripe, so the success_url
          // (/app?welcome=1) passes the /app gate when the user returns.
          await completeOnboarding();
          window.location.href = data.url;
          return;
        }
      }

      // Billing not configured (503), or no URL came back: continue the flow
      // to the Connect step. Record nothing.
      setStarting(null);
      setStep(STEP_CONNECT);
    } catch {
      // Network/other failure: still advance the user through setup.
      setStarting(null);
      setStep(STEP_CONNECT);
    }
  }

  function skipPlan() {
    if (starting) return;
    setStep(STEP_CONNECT);
  }

  async function finish() {
    if (finishing) return;
    setFinishing(true);
    try {
      // Mark onboarded so the /app gate lets the user in.
      await completeOnboarding();
    } catch {
      // completeOnboarding never throws; stay defensive.
    }
    window.location.href = "/app";
  }

  // Progress index within the numbered setup steps (Workspace = 1 .. Finish = 5).
  const progressIndex = Math.max(0, step - 1); // 0-based; -1 on Welcome -> clamps to 0

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
          {step !== STEP_WELCOME && (
            <div className="ob-progress">
              <span className="ob-progress-label">
                Step {progressIndex + 1} of {PROGRESS_STEPS}
              </span>
              <div className="ob-progress-track">
                {Array.from({ length: PROGRESS_STEPS }).map((_, i) => (
                  <span
                    key={i}
                    className={`ob-progress-dot ${i <= progressIndex ? "is-on" : ""}`}
                  />
                ))}
              </div>
            </div>
          )}
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
              {step === STEP_WELCOME && (
                <StepWelcome onStart={() => setStep(STEP_WORKSPACE)} />
              )}
              {step === STEP_WORKSPACE && (
                <StepWorkspace
                  name={name}
                  setName={setName}
                  bizType={bizType}
                  setBizType={setBizType}
                />
              )}
              {step === STEP_FOCUS && (
                <StepFocus goals={goals} toggle={toggleGoal} />
              )}
              {step === STEP_PLAN && (
                <StepPlan
                  interval={interval}
                  setInterval={setInterval}
                  starting={starting}
                  statusNote={statusNote}
                  onStart={startTrial}
                  onSkip={skipPlan}
                />
              )}
              {step === STEP_CONNECT && (
                <StepConnect
                  connected={connected}
                  toggle={toggleConnector}
                  connLoading={connLoading}
                  configured={composioConfigured}
                />
              )}
              {step === STEP_FINISH && (
                <StepFinish
                  name={name}
                  finishing={finishing}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Welcome: no footer nav (the Get started button lives in the pane). */}

        {/* Workspace + Focus + Connect: standard Back/Continue footer. */}
        {(step === STEP_WORKSPACE || step === STEP_FOCUS || step === STEP_CONNECT) && (
          <footer className="ob-foot">
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              onClick={goBack}
              disabled={busy}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={goNext}
              disabled={!canContinueFor(step, name) || busy}
            >
              {busy ? "Saving..." : "Continue"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </footer>
        )}

        {/* Plan: Back + trial note (plan cards / Skip drive navigation). */}
        {step === STEP_PLAN && (
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

        {/* Finish: Back only (the Go to Intelbase button lives in the pane). */}
        {step === STEP_FINISH && (
          <footer className="ob-foot">
            <button
              type="button"
              className="ob-btn ob-btn-ghost"
              onClick={goBack}
              disabled={finishing}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <span className="ob-foot-note">You can change all of this later in Settings.</span>
          </footer>
        )}
      </div>
    </div>
  );
}

function canContinueFor(step: number, name: string): boolean {
  if (step === STEP_WORKSPACE) return name.trim().length > 0;
  return true;
}

function StepWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="ob-pane ob-pane-center">
      <span className="ob-hero-mark">
        <Sparkles size={26} strokeWidth={2} />
      </span>
      <h1 className="ob-title">Let us set up your Intelbase</h1>
      <p className="ob-sub ob-sub-center">
        A few quick steps to name your workspace, choose what to focus on, and
        connect your tools. It takes about a minute.
      </p>
      <button
        type="button"
        className="ob-btn ob-btn-primary ob-btn-hero"
        onClick={onStart}
      >
        Get started <ArrowRight size={16} />
      </button>
    </div>
  );
}

function StepWorkspace({
  name,
  setName,
  bizType,
  setBizType,
}: {
  name: string;
  setName: (v: string) => void;
  bizType: string;
  setBizType: (v: string) => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">Name your workspace</h1>
      <p className="ob-sub">
        This is what your team and Intelbase will call your business.
      </p>
      <div className="ob-field">
        <label className="ob-label" htmlFor="ob-name">
          Workspace name
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
        <span className="ob-label">
          What does your business do? <span className="ob-optional">optional</span>
        </span>
        <div className="ob-chips">
          {BUSINESS_TYPES.map((t) => {
            const on = bizType === t;
            return (
              <button
                key={t}
                type="button"
                className={`ob-chip ${on ? "is-on" : ""}`}
                onClick={() => setBizType(on ? "" : t)}
                aria-pressed={on}
              >
                {on && <Check size={14} strokeWidth={3} />}
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepFocus({
  goals,
  toggle,
}: {
  goals: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">What should Intelbase focus on first?</h1>
      <p className="ob-sub">Pick as many as you like. You can adjust this anytime.</p>
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
  onSkip,
}: {
  interval: BillingInterval;
  setInterval: (v: BillingInterval) => void;
  starting: PlanId | null;
  statusNote: string;
  onStart: (plan: PlanId) => void;
  onSkip: () => void;
}) {
  return (
    <div className="ob-pane">
      <h1 className="ob-title">Choose your plan</h1>
      <p className="ob-sub">No charge today. Start with a 14-day free trial.</p>

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

      <button
        type="button"
        className="ob-skip"
        onClick={onSkip}
        disabled={!!starting}
      >
        Skip for now
      </button>
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

function StepFinish({
  name,
  finishing,
  onFinish,
}: {
  name: string;
  finishing: boolean;
  onFinish: () => void;
}) {
  const workspace = name.trim() || "your workspace";
  return (
    <div className="ob-pane ob-pane-center">
      <span className="ob-hero-mark ob-hero-mark-done">
        <Check size={26} strokeWidth={2.6} />
      </span>
      <h1 className="ob-title">You are all set</h1>
      <p className="ob-sub ob-sub-center">
        {workspace} is ready. Intelbase will start working on what you chose.
        You can fine-tune everything from inside the app.
      </p>
      <button
        type="button"
        className="ob-btn ob-btn-primary ob-btn-hero"
        onClick={onFinish}
        disabled={finishing}
      >
        {finishing ? "Opening Intelbase..." : "Go to Intelbase"}
        {!finishing && <ArrowRight size={16} />}
      </button>
    </div>
  );
}
