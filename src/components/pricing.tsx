"use client";

import { Icon } from "@/components/icons";
import { trackLead } from "@/lib/meta-pixel";

type Tier = {
  name: string;
  who: string;
  lines: string[];
  featured?: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    name: "Launch",
    who: "The core OS live on your site. For teams that want the Concierge answering and booking first.",
    lines: [
      "AI Website Concierge answering 24/7",
      "Qualifies leads and books calls on its own",
      "Guardrails so it stays on-script",
      "One control dashboard",
    ],
  },
  {
    name: "Growth",
    who: "The full OS, running your whole front office. What most clients pick.",
    featured: true,
    badge: "Most popular",
    lines: [
      "Everything in Launch",
      "Autonomous lead generation, Apollo-powered outbound",
      "Lead nurture on autopilot across channels",
      "AI ad engine, plus the full control dashboard",
    ],
  },
  {
    name: "Custom",
    who: "Multi-brand, bespoke rules, and deeper integrations scoped to your stack.",
    lines: [
      "Everything in Growth",
      "Multi-brand and multi-location setups",
      "Bespoke guardrails and qualifying logic",
      "Deeper integrations with your tools",
    ],
  },
];

export function Pricing({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="section" id="pricing">
      <div className="section-head reveal">
        <span className="section-tag">Pricing</span>
        <h2 className="section-title">
          Three ways onto the OS. <span className="accent">Quote after the call.</span>
        </h2>
        <p className="section-sub">
          Setup plus a monthly retainer, scoped to your business. We send the
          quote after the call, not before. Most clients land on Growth.
        </p>
      </div>

      <div className="pricing-tiers reveal">
        {tiers.map((t) => (
          <div className={"tier" + (t.featured ? " featured" : "")} key={t.name}>
            {t.badge && <span className="tier-badge">{t.badge}</span>}
            <div className="tier-name">{t.name}</div>
            <p className="tier-for">{t.who}</p>
            <div className="tier-lines">
              {t.lines.map((l) => (
                <div className="tier-line" key={l}>
                  <span className="check">
                    <Icon name="check" />
                  </span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
            <div className="tier-cta">
              <button
                className={t.featured ? "btn btn-primary" : "btn btn-ghost"}
                onClick={() => {
                  trackLead();
                  onQuote();
                }}
              >
                Get my quote <span className="arr">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-positioning reveal">
        <p className="pricing-note">
          Setup plus monthly, no seat fees. We send the quote after the call,
          not before. <strong>Most clients land on Growth.</strong>
        </p>
      </div>
    </section>
  );
}
