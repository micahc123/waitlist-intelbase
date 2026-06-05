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
    icon: "sparkles",
    tag: "Concierge",
    title: "AI Website Concierge",
    desc: "Answers visitors, qualifies them, and books calls 24/7. No forms left unanswered, no lead lost at midnight.",
    meta: "Answers in seconds",
    longDesc:
      "The OS greets every visitor the moment they land, answers their questions in your voice, qualifies them, and books the call. It runs around the clock, so no form sits unanswered and no lead is lost at midnight. When it is unsure of something that matters, it hands off to you instead of guessing.",
    includes: [
      "Replies to every visitor in seconds, day or night",
      "Qualifies leads with questions tuned to your offer",
      "Books calls straight onto your calendar",
      "Hands off to you the moment it is unsure, never invents a price",
    ],
    outcomes: [
      "Every visitor answered, not just the ones who fill a form",
      "Calls booked while you sleep",
      "Guardrails keep it on-script, so you can trust it",
    ],
  },
  {
    icon: "bolt",
    tag: "Lead Gen",
    title: "Autonomous Lead Generation",
    desc: "Finds your buyers and reaches out for you, filling the calendar with qualified calls.",
    meta: "Fills the calendar",
    longDesc:
      "The OS finds the people who match your buyer and reaches out for you, Apollo-powered, so the calendar fills with qualified calls without a sales hire. It runs the outbound on its own and only surfaces the conversations worth your time.",
    includes: [
      "Builds and works target lists from your ideal-customer profile",
      "Apollo-powered outbound that runs on its own",
      "Qualifies replies and books the call",
      "Routes anything off-script back to you",
    ],
    outcomes: [
      "A calendar that fills without a sales hire",
      "Outbound that runs while you do the work",
      "More qualified calls, less manual prospecting",
    ],
  },
  {
    icon: "share",
    tag: "Nurture",
    title: "Lead Nurture on Autopilot",
    desc: "Follows up across channels until a lead books or opts out, without you remembering to.",
    meta: "Never goes cold",
    longDesc:
      "Most leads die in an inbox. The OS follows up across email and SMS until the lead books or opts out, so nothing goes cold waiting on a human to remember. It keeps every conversation moving on its own.",
    includes: [
      "Multi-channel follow-up triggered the moment a lead comes in",
      "Keeps going until the lead books or opts out",
      "CRM sync so context is never lost",
      "Stops cleanly on an opt-out, every time",
    ],
    outcomes: [
      "Fewer leads lost between first touch and booked call",
      "Follow-up that never forgets and never sleeps",
      "Faster booking, which lifts conversion",
    ],
  },
  {
    icon: "brain",
    tag: "Ads",
    title: "AI Ad Engine",
    desc: "Generates the creative and runs the campaigns, optimizing spend on its own.",
    meta: "Runs your ads",
    longDesc:
      "The OS generates the ad creative and runs the campaigns, testing variations and moving budget to what works, on its own. It tests 30 to 50 ad variations a month where a human team runs a handful, so winners surface faster and losers get cut before they burn spend.",
    includes: [
      "Generates video and image creative, 30 to 50 variations a month",
      "Runs and structures the campaigns end to end",
      "Optimizes budget toward the winners automatically",
      "Feeds the leads it wins straight into the rest of the OS",
    ],
    outcomes: [
      "Far more creative tested than a human team can run",
      "Spend that moves to what works, every week",
      "Ads, leads, and follow-up running as one loop",
    ],
  },
  {
    icon: "node",
    tag: "Dashboard",
    title: "One Control Dashboard",
    desc: "The whole autonomous loop in one view: conversations, qualified leads, booked calls, ad performance, ROI.",
    meta: "One source of truth",
    longDesc:
      "You watch the whole OS work from one screen: conversations, qualified leads, booked calls, ad performance, and ROI, updated as it happens. The autonomous loop runs itself and the dashboard shows you exactly what it is doing.",
    includes: [
      "Live view of conversations, qualified leads, and booked calls",
      "Ad performance and ROI in the same place",
      "See where the OS handed off to you and why",
      "Replaces the spreadsheets and scattered tools",
    ],
    outcomes: [
      "The whole autonomous loop in one view",
      "Know what the OS is doing without chasing tabs",
      "Trust the autonomy because you can see it work",
    ],
  },
];

const expansion: { name: string; desc: string }[] = [
  { name: "AI Voice Receptionist", desc: "Answers and qualifies phone calls and books them." },
  { name: "AI Inbox Manager", desc: "Triages inbound email and DMs and drafts the replies." },
  { name: "Multilingual Front Desk", desc: "Handles visitors in English, Cantonese, and Mandarin." },
  { name: "Quote & Proposal Builder", desc: "Turns a conversation into a tailored quote, with price guardrails." },
  { name: "Reactivation Engine", desc: "Re-engages dormant leads and past customers on its own." },
  { name: "Market & Competitor Watch", desc: "Monitors signals and sends short, useful summaries." },
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
          <span className="section-tag">What it runs</span>
          <h2 className="section-title">
            One OS. <span className="accent">Five things it runs for you.</span>
          </h2>
          <p className="section-sub">
            intelbase OS answers visitors, finds buyers, follows up, and runs
            your ads, on its own. When it is unsure of something that matters, it
            hands off to you. Autonomous, not reckless.
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

        <div
          className="services-grow reveal"
          style={{
            marginTop: "clamp(2rem, 5vw, 3.5rem)",
            textAlign: "center",
          }}
        >
          <span className="section-tag">And it grows with you</span>
          <p
            className="section-sub"
            style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}
          >
            Start with the core five. Add modules as you grow, each one
            autonomous and under the same guardrails.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 auto",
              maxWidth: "var(--max-w)",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              justifyContent: "center",
            }}
          >
            {expansion.map((m) => (
              <li
                key={m.name}
                title={m.desc}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--bg-soft)",
                  color: "var(--ink)",
                  borderRadius: "var(--radius-pill)",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    flex: "0 0 auto",
                  }}
                />
                {m.name}
              </li>
            ))}
          </ul>
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
