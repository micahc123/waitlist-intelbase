"use client";

// GROW-08: AI Readiness Audit. A self-serve scorecard: a handful of questions
// about how the visitor's business handles leads today. We compute a readiness
// score (0..100) and a tailored recommendation that maps to intelbase OS modules,
// then capture name/email/business as a lead (source = "audit") via /api/audit.
//
// Scoring is deterministic and client-side, so the result is instant. The server
// route only persists the lead. Matches the site design system (.section / .btn /
// CSS tokens) with a scoped `ib-audit-` style block. No em dashes (house style).

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/meta-pixel";

// Each option carries points (0..3) and the OS module it implies a gap in.
type Option = {
  label: string;
  points: number;
  // The module that closes this gap, surfaced in the recommendation when the
  // answer scores low.
  module?: string;
};

type Question = {
  id: string;
  prompt: string;
  options: Option[];
};

// 7 questions. Higher points = more "AI-ready" / less manual pain.
const QUESTIONS: Question[] = [
  {
    id: "speed",
    prompt: "When a new lead comes in, how fast do they hear back?",
    options: [
      { label: "Within a minute, every time", points: 3 },
      { label: "Usually within an hour", points: 2, module: "AI Website Concierge" },
      { label: "Same day, if we catch it", points: 1, module: "AI Website Concierge" },
      { label: "Honestly, often not at all", points: 0, module: "AI Website Concierge" },
    ],
  },
  {
    id: "after-hours",
    prompt: "What happens to a visitor who lands on your site at midnight?",
    options: [
      { label: "They get answered and can book right away", points: 3 },
      { label: "They can leave a form, we reply later", points: 1, module: "AI Website Concierge" },
      { label: "Nothing, they bounce", points: 0, module: "AI Website Concierge" },
    ],
  },
  {
    id: "followup",
    prompt: "How do you follow up with leads who do not buy on the first touch?",
    options: [
      { label: "Automated multi-step follow-up until they act", points: 3 },
      { label: "We try to remember to chase them", points: 1, module: "Lead Nurture on Autopilot" },
      { label: "We mostly do not follow up", points: 0, module: "Lead Nurture on Autopilot" },
    ],
  },
  {
    id: "outbound",
    prompt: "How do new leads reach your pipeline today?",
    options: [
      { label: "Steady outbound plus inbound, it is full", points: 3 },
      { label: "Mostly referrals and word of mouth", points: 1, module: "Autonomous Lead Generation" },
      { label: "We wait for people to come to us", points: 0, module: "Autonomous Lead Generation" },
    ],
  },
  {
    id: "channels",
    prompt: "Where do you talk to leads?",
    options: [
      { label: "One place, all channels land together", points: 3 },
      { label: "A few channels, but they are scattered", points: 1, module: "AI Inbox Manager" },
      { label: "Whatever they message, we scramble", points: 0, module: "AI Inbox Manager" },
    ],
  },
  {
    id: "ads",
    prompt: "How are your ads run?",
    options: [
      { label: "Always-on, lots of creative tested", points: 3 },
      { label: "We boost a post now and then", points: 1, module: "AI Ad Engine" },
      { label: "We do not run ads", points: 0, module: "AI Ad Engine" },
    ],
  },
  {
    id: "visibility",
    prompt: "Can you see your leads, calls, and ROI in one view?",
    options: [
      { label: "Yes, one dashboard shows it all", points: 3 },
      { label: "Spread across spreadsheets and tools", points: 1, module: "One Control Dashboard" },
      { label: "We are mostly guessing", points: 0, module: "One Control Dashboard" },
    ],
  },
];

const MAX_POINTS = QUESTIONS.length * 3;

type Band = {
  min: number; // inclusive percentage
  tier: string;
  blurb: string;
};

// Score bands map a percentage to a readable tier + framing.
const BANDS: Band[] = [
  {
    min: 75,
    tier: "Autonomy-ready",
    blurb:
      "You already run a tight front office. intelbase OS would take the manual parts off your plate and push more of it to run on its own.",
  },
  {
    min: 45,
    tier: "Half-manual",
    blurb:
      "You are doing the right things, but too much depends on someone remembering to. intelbase OS would automate the gaps so nothing warm goes cold.",
  },
  {
    min: 0,
    tier: "Leaking leads",
    blurb:
      "Leads are slipping through at several points. This is exactly what intelbase OS is built to fix, fast.",
  },
];

type Result = {
  score: number; // 0..100
  tier: string;
  blurb: string;
  modules: string[]; // recommended modules, highest-impact first
  recommendation: string;
};

export function ReadinessAudit() {
  // answers: questionId -> selected option index
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  const result: Result | null = useMemo(() => {
    if (!allAnswered) return null;
    return computeResult(answers);
  }, [answers, allAnswered]);

  function pick(qid: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !result) return;
    setError(null);

    if (!isValidEmail(email.trim())) {
      setError("Add a valid email so we can send your scorecard.");
      return;
    }

    setSaving(true);
    try {
      const answerLabels: Record<string, string> = {};
      for (const q of QUESTIONS) {
        const idx = answers[q.id];
        if (idx !== undefined) answerLabels[q.prompt] = q.options[idx].label;
      }

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          business: business.trim(),
          score: result.score,
          tier: result.tier,
          recommendation: result.recommendation,
          answers: answerLabels,
        }),
      });
      const data = (await res.json()) as { captured?: boolean; error?: string };

      if (!res.ok || data.error) {
        setError(data.error || "Could not save your scorecard. Try again.");
        return;
      }

      setSubmitted(true);
      trackEvent("Lead", { content_name: "readiness_audit" });
    } catch {
      setError("Could not reach the server. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section" id="audit">
      <style>{AUDIT_CSS}</style>
      <div className="section-head reveal">
        <span className="section-tag">2 minute scorecard</span>
        <h2 className="section-title">
          How <span className="accent">AI-ready</span> is your front office?
        </h2>
        <p className="section-sub">
          Answer seven quick questions about how you handle leads today. Get an
          instant readiness score and a tailored map of which intelbase OS modules
          would move the needle first.
        </p>
      </div>

      <div className="ib-audit-wrap reveal">
        <div className="ib-audit-questions">
          {QUESTIONS.map((q, qi) => (
            <fieldset className="ib-audit-q" key={q.id}>
              <legend className="ib-audit-q-prompt">
                <span className="ib-audit-q-num">{qi + 1}</span>
                {q.prompt}
              </legend>
              <div className="ib-audit-options">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <button
                      type="button"
                      key={opt.label}
                      className={
                        "ib-audit-option" +
                        (selected ? " ib-audit-option-on" : "")
                      }
                      onClick={() => pick(q.id, oi)}
                      aria-pressed={selected}
                    >
                      <span className="ib-audit-radio" aria-hidden />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className="ib-audit-panel">
          {!result ? (
            <div className="ib-audit-empty">
              <div className="ib-audit-gauge ib-audit-gauge-empty">--</div>
              <p className="ib-audit-empty-text">
                Answer all seven questions to see your readiness score and which
                modules to start with.
              </p>
              <p className="ib-audit-progress">
                {Object.keys(answers).length} of {QUESTIONS.length} answered
              </p>
            </div>
          ) : !submitted ? (
            <div className="ib-audit-result">
              <div className="ib-audit-gauge">{result.score}</div>
              <div className="ib-audit-tier">{result.tier}</div>
              <p className="ib-audit-blurb">{result.blurb}</p>

              {result.modules.length > 0 && (
                <div className="ib-audit-modules">
                  <span className="ib-audit-modules-label">
                    Start with these modules
                  </span>
                  <ul className="ib-audit-modules-list">
                    {result.modules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form className="ib-audit-form" onSubmit={onSubmit}>
                <input
                  className="ib-audit-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Your name"
                  autoComplete="name"
                />
                <input
                  className="ib-audit-input"
                  type="text"
                  placeholder="Your business"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  aria-label="Your business"
                  autoComplete="organization"
                />
                <input
                  className="ib-audit-input"
                  type="email"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Your email"
                  autoComplete="email"
                  required
                />
                {error && <p className="ib-audit-error">{error}</p>}
                <button
                  className="btn btn-primary ib-audit-submit"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Sending..." : "Email me the full scorecard"}
                  <span className="arr">→</span>
                </button>
                <p className="ib-audit-fine">
                  We send the detailed breakdown and your tailored module plan.
                </p>
              </form>
            </div>
          ) : (
            <div className="ib-audit-done">
              <div className="ib-audit-gauge">{result.score}</div>
              <div className="ib-audit-tier">{result.tier}</div>
              <p className="ib-audit-blurb">
                Done. Your full scorecard is on its way to {email.trim()}. Want to
                fast-track it? Book a call and we will walk your results together.
              </p>
              <a
                className="btn btn-primary ib-audit-submit"
                href="https://cal.com/intelbase/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("Lead", { content_name: "audit_book_call" })
                }
              >
                Book a free call <span className="arr">→</span>
              </a>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function computeResult(answers: Record<string, number>): Result {
  let points = 0;
  // Collect modules where the answer scored low (a real gap), de-duped, ordered
  // by how weak the answer was (weakest first).
  const gaps: { module: string; points: number }[] = [];

  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const opt = q.options[idx];
    points += opt.points;
    if (opt.module && opt.points <= 1) {
      gaps.push({ module: opt.module, points: opt.points });
    }
  }

  const score = Math.round((points / MAX_POINTS) * 100);
  const band = BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];

  // Dedupe modules keeping the weakest occurrence, then take the top 3.
  const seen = new Map<string, number>();
  for (const g of gaps) {
    const prev = seen.get(g.module);
    if (prev === undefined || g.points < prev) seen.set(g.module, g.points);
  }
  const modules = [...seen.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([m]) => m)
    .slice(0, 3);

  const recommendation =
    modules.length > 0
      ? `${band.tier} (${score}/100). ${band.blurb} Highest-impact modules to start with: ${modules.join(", ")}.`
      : `${band.tier} (${score}/100). ${band.blurb}`;

  return { score, tier: band.tier, blurb: band.blurb, modules, recommendation };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AUDIT_CSS = `
.ib-audit-wrap {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  max-width: var(--max-w);
  margin: clamp(1.5rem, 4vw, 2.5rem) auto 0;
  align-items: start;
}
@media (max-width: 860px) {
  .ib-audit-wrap { grid-template-columns: 1fr; }
}
.ib-audit-questions {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.ib-audit-q {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.25rem;
  margin: 0;
}
.ib-audit-q-prompt {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink);
  margin-bottom: 0.8rem;
  padding: 0;
}
.ib-audit-q-num {
  flex: 0 0 auto;
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: var(--blue-tint);
  color: var(--blue-deep);
  font-size: 0.82rem; font-weight: 800;
}
.ib-audit-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ib-audit-option {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  text-align: left;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border);
  background: var(--bg-soft);
  color: var(--ink-2);
  border-radius: var(--radius);
  font-size: 0.94rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color .12s ease, background .12s ease, color .12s ease;
}
.ib-audit-option:hover { border-color: var(--rule-2); }
.ib-audit-radio {
  flex: 0 0 auto;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid var(--rule-2);
  transition: border-color .12s ease, background .12s ease;
}
.ib-audit-option-on {
  border-color: var(--brand);
  background: var(--blue-tint);
  color: var(--ink);
  font-weight: 600;
}
.ib-audit-option-on .ib-audit-radio {
  border-color: var(--brand);
  background: var(--brand);
  box-shadow: inset 0 0 0 3px var(--blue-tint);
}

.ib-audit-panel {
  position: sticky;
  top: 90px;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: clamp(1.25rem, 3vw, 1.75rem);
}
.ib-audit-gauge {
  width: 96px; height: 96px;
  margin: 0 auto 0.75rem;
  display: grid; place-items: center;
  border-radius: 50%;
  background: var(--blue-tint);
  color: var(--blue-deep);
  font-size: 2.1rem; font-weight: 800;
  border: 3px solid var(--brand);
}
.ib-audit-gauge-empty {
  background: var(--bg-mute);
  color: var(--body-2);
  border-color: var(--rule-2);
}
.ib-audit-empty-text, .ib-audit-blurb {
  text-align: center;
  color: var(--body);
  font-size: 0.94rem;
  line-height: 1.55;
  margin: 0.5rem 0 0;
}
.ib-audit-progress {
  text-align: center;
  margin-top: 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--body-2);
}
.ib-audit-tier {
  text-align: center;
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--ink);
}
.ib-audit-modules {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--border);
}
.ib-audit-modules-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--body-2);
  margin-bottom: 0.6rem;
}
.ib-audit-modules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.ib-audit-modules-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}
.ib-audit-modules-list li::before {
  content: "";
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--brand);
  flex: 0 0 auto;
}
.ib-audit-form {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ib-audit-input {
  width: 100%;
  padding: 0.72rem 0.9rem;
  font-size: 0.94rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-soft);
  color: var(--ink);
  font-family: inherit;
  outline: none;
}
.ib-audit-input:focus { border-color: var(--brand); background: var(--bg); }
.ib-audit-submit { width: 100%; justify-content: center; margin-top: 0.3rem; }
.ib-audit-error { color: #B42318; font-size: 0.88rem; margin: 0; }
.ib-audit-fine {
  text-align: center;
  font-size: 0.8rem;
  color: var(--body-2);
  margin: 0.5rem 0 0;
}
.ib-audit-done .ib-audit-blurb { margin-bottom: 1.1rem; }
`;
