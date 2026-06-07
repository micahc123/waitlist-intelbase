"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Tier = {
  name: string;
  monthly: number;
  who: string;
  popular?: boolean;
  feats: string[];
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    monthly: 99,
    who: "For solo operators getting their front office running.",
    feats: [
      "AI Website Concierge on 1 site",
      "Up to 500 leads captured per month",
      "Calendar booking and confirmations",
      "Basic follow-up sequences",
      "One Command Dashboard",
    ],
  },
  {
    name: "Growth",
    monthly: 299,
    who: "For growing teams that want every lead worked automatically.",
    popular: true,
    feats: [
      "Everything in Starter",
      "Up to 5,000 leads captured per month",
      "Autonomous Lead Gen across channels",
      "AI Ad Engine with budget guardrails",
      "Full Memory Cortex and smart routing",
      "Up to 5 connected tools and seats",
    ],
  },
  {
    name: "Scale",
    monthly: 799,
    who: "For established operations running at full volume.",
    feats: [
      "Everything in Growth",
      "Unlimited leads and sites",
      "Unlimited seats and connected tools",
      "Advanced ad optimization and reporting",
      "Custom agent workflows and guardrails",
      "Priority support and onboarding",
    ],
  },
];

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function LandingPricing({ full = false }: { full?: boolean }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="lp-sec" id="pricing">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow"><span className="lp-dot" />Pricing</span>
          <h2 className="lp-h2">Simple plans that grow with you</h2>
          <p className="lp-lede">
            Every plan includes a 14-day free trial. Switch to annual and get two months free.
          </p>

          <div className="lp-toggle" role="group" aria-label="Billing period">
            <button className={annual ? "" : "on"} onClick={() => setAnnual(false)} aria-pressed={!annual}>
              Monthly
            </button>
            <button className={annual ? "on" : ""} onClick={() => setAnnual(true)} aria-pressed={annual}>
              Annual <span className="lp-save">2 months free</span>
            </button>
          </div>
        </div>

        <div className="lp-tiers">
          {TIERS.map((t) => {
            const annualTotal = t.monthly * 10;
            const perMonth = annual ? Math.round(annualTotal / 12) : t.monthly;
            return (
              <div className={`lp-tier ${t.popular ? "pop" : ""}`} key={t.name}>
                {t.popular && <div className="lp-tier-badge">Most popular</div>}
                <div className="lp-tier-name">{t.name}</div>
                <p className="lp-tier-who">{t.who}</p>

                <div className="lp-tier-price">
                  <span className="lp-tier-amount">${fmt(perMonth)}</span>
                  <span className="lp-tier-per">/mo</span>
                </div>
                <div className="lp-tier-bill">
                  {annual ? `$${fmt(annualTotal)} billed yearly` : "Billed monthly"}
                </div>

                <a href="/signup" className={`lp-btn ${t.popular ? "lp-btn-primary" : "lp-btn-ghost"}`}>
                  Start free trial
                </a>

                <ul className="lp-tier-feats">
                  {t.feats.map((f) => (
                    <li key={f}><Check strokeWidth={2.4} /> {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="lp-tier-trial">
          {full
            ? "All plans start with a 14-day free trial. No card needed to look around. Cancel anytime."
            : "14-day free trial on every plan. Cancel anytime."}
        </p>
      </div>
    </section>
  );
}
