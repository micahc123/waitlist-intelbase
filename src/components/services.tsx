"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

type IconName =
  | "bolt"
  | "node"
  | "sparkles"
  | "brain"
  | "box"
  | "share"
  | "code";

type Service = {
  icon: IconName;
  tag: string;
  title: string;
  desc: string;
  meta: string;
  longDesc: string;
  includes: string[];
  outcomes: string[];
};

const services: Service[] = [
  {
    icon: "bolt",
    tag: "OpenClaw",
    title: "OpenClaw Full Setup",
    desc: "Full OpenClaw deployment on your Mac Mini, VPS, or any system — configured, integrated, and ready to go.",
    meta: "Live in 30 min",
    longDesc:
      "We deploy OpenClaw end-to-end on your hardware or cloud, wire it into your stack, and hand you the keys with a full walk-through.",
    includes: [
      "Install + configure OpenClaw on Mac Mini, VPS, or your cloud",
      "Connect your data sources, auth, and existing tooling",
      "Custom system prompts, agents, and tools wired to your workflow",
      "30-min walk-through + documentation so your team owns it",
    ],
    outcomes: [
      "A production agent platform on your hardware",
      "Live in 30 minutes from start to handoff",
      "No vendor lock-in — you own everything",
    ],
  },
  {
    icon: "share",
    tag: "Automation",
    title: "Business Automation",
    desc: "Lead capture, email sequences, CRM syncing, cold email — your whole back-office running itself while you sleep.",
    meta: "Ships in 72h",
    longDesc:
      "We map your back-office, kill the time-sink steps, and automate the parts that humans shouldn't be doing — without breaking the parts that work.",
    includes: [
      "Lead capture, scoring, and routing across your funnel",
      "CRM sync, deal-stage automation, and email sequences",
      "Cold outbound: list-building, personalization, deliverability",
      "Slack / WhatsApp / email notifications when humans are needed",
    ],
    outcomes: [
      "Save 8–20 hrs/week of back-office work",
      "Faster response time → higher conversion",
      "Pipeline that runs without manual babysitting",
    ],
  },
  {
    icon: "sparkles",
    tag: "Social",
    title: "Social Media & AI Ads",
    desc: "Content + ad generation with Higgsfield and OpenClaw. Scripting, visuals, posting, paid campaigns on autopilot.",
    meta: "Pipeline in 5d",
    longDesc:
      "A content + ad engine that ships consistently — scripts, visuals, and creatives generated, scheduled, and posted automatically.",
    includes: [
      "Higgsfield + OpenClaw pipelines for video, image, and copy",
      "Brand-tuned voice, hooks, and CTAs across IG / TikTok / X / LinkedIn",
      "Paid ad creative generation + variant testing",
      "Auto-posting + analytics dashboards",
    ],
    outcomes: [
      "Daily posting cadence without a content team",
      "More creative tests per dollar of ad spend",
      "Your brand voice, not generic AI slop",
    ],
  },
  {
    icon: "node",
    tag: "n8n",
    title: "n8n Workflow Automation",
    desc: "Custom n8n workflows for lead routing, data syncing, notifications, and AI-powered pipelines.",
    meta: "Done in <1h",
    longDesc:
      "We build production n8n workflows that connect your tools, sync your data, and add AI where it actually helps — hosted on your stack.",
    includes: [
      "Self-hosted or cloud n8n setup, secured properly",
      "Custom workflows for routing, syncing, alerting, and enrichment",
      "AI nodes for classification, extraction, and summarization",
      "Error handling, retries, and observability built in",
    ],
    outcomes: [
      "No more glue-code in 5 different SaaS tools",
      "Workflows you can read, edit, and own",
      "Drop-in AI steps where they earn their keep",
    ],
  },
  {
    icon: "brain",
    tag: "RAG",
    title: "Custom LLM & RAG",
    desc: "Train a model on your business data. RAG pipelines that know your products, policies, and history — so AI answers like it works there.",
    meta: "Ships in 72h",
    longDesc:
      "We build retrieval pipelines tuned to your data so the model answers like it works at your company — not a generic chatbot.",
    includes: [
      "Ingest + chunk + embed your docs, products, tickets, history",
      "Hybrid search (vector + keyword) tuned to your domain",
      "Eval harness: ground-truth questions, scored answers, regression tests",
      "Frontend or API delivery, wired into your tools",
    ],
    outcomes: [
      "Accurate answers from your real data",
      "Cited sources — no hallucinations the team can't verify",
      "Quality stays high as your data grows",
    ],
  },
  {
    icon: "box",
    tag: "Custom",
    title: "Custom AI Solutions",
    desc: "Anything outside the box — multi-agent systems, internal tools, workflow copilots. We scope it, build it, ship it.",
    meta: "Scoped to brief",
    longDesc:
      "When the off-the-shelf answer doesn't fit, we design and build the system from scratch — agents, internal tools, copilots, weird stuff.",
    includes: [
      "Discovery + architecture for the problem you actually have",
      "Multi-agent orchestration, tool-use, and custom evals",
      "Internal tools, dashboards, or copilots wired into your stack",
      "Flat quote, fixed scope, hand-off when it ships",
    ],
    outcomes: [
      "A bespoke system that fits your business",
      "No 'AI features bolted onto SaaS' tax",
      "You own the code and the IP",
    ],
  },
  {
    icon: "code",
    tag: "Claude",
    title: "Claude Systems & MCP",
    desc: "Claude Code setups, MCP server builds, and Claude-powered agents wired into your tools. From dev copilots to autonomous pipelines.",
    meta: "Ships in 5d",
    longDesc:
      "We design Claude-powered systems for engineering teams and ops: dev copilots, MCP servers, autonomous pipelines, and agentic workflows.",
    includes: [
      "Claude Code rollout: settings, skills, hooks, slash commands",
      "Custom MCP servers exposing your tools to Claude safely",
      "Subagents + agent SDK pipelines for autonomous work",
      "Guardrails, eval suites, and observability for production use",
    ],
    outcomes: [
      "Engineers ship faster with Claude wired into their workflow",
      "Internal tools accessible to AI without security holes",
      "Reliable agentic pipelines instead of brittle prompts",
    ],
  },
];

export function Services({ onQuote }: { onQuote: () => void }) {
  const [active, setActive] = useState<Service | null>(null);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <section className="section" id="services">
        <div className="section-head reveal">
          <span className="section-tag">What we build</span>
          <h2 className="section-title">
            Real systems. <span className="accent">Not chatbots.</span>
          </h2>
          <p className="section-sub">
            End-to-end AI infrastructure and done-for-you services that plug into
            your stack and actually run your business.
          </p>
        </div>
        <div className="services reveal">
          {services.map((s) => (
            <button
              type="button"
              className="service"
              key={s.title}
              onClick={() => setActive(s)}
              aria-label={`Learn more about ${s.title}`}
            >
              <div className="service-icon">
                <Icon name={s.icon} />
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <div className="service-foot">
                <span className="service-meta">{s.meta}</span>
                <span className="service-arrow">
                  <Icon name="arrow" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div
        className={"modal-backdrop" + (active ? " open" : "")}
        onClick={() => setActive(null)}
        aria-hidden={!active}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {active && (
            <>
              <div className="modal-head">
                <div>
                  <span className="service-detail-tag">
                    <Icon name={active.icon} /> {active.tag}
                  </span>
                  <h3 className="service-detail-title">{active.title}</h3>
                  <p className="service-detail-desc">{active.longDesc}</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="service-detail-section">
                <h5>What&apos;s included</h5>
                <ul className="service-detail-list">
                  {active.includes.map((it) => (
                    <li key={it}>
                      <Icon name="check" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-detail-section">
                <h5>Outcomes</h5>
                <ul className="service-detail-list">
                  {active.outcomes.map((it) => (
                    <li key={it}>
                      <Icon name="check" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-detail-foot">
                <span
                  className="modal-eyebrow"
                  style={{ alignSelf: "center" }}
                >
                  {active.meta}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActive(null);
                    onQuote();
                  }}
                  style={{ marginLeft: "auto" }}
                >
                  Get a quote for this <span className="arr">→</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
