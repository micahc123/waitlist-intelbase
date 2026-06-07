"use client";

import { motion } from "motion/react";
import { CreditCard, Plug, Sparkles } from "lucide-react";

const STEPS = [
  {
    n: "Step 01",
    icon: CreditCard,
    title: "Subscribe",
    desc: "Pick a plan and start a 14-day free trial. You are running in minutes, not weeks.",
  },
  {
    n: "Step 02",
    icon: Plug,
    title: "Connect your tools",
    desc: "Link your inbox, calendar, CRM, ads and chat in a few clicks. No code, no migration.",
  },
  {
    n: "Step 03",
    icon: Sparkles,
    title: "It runs your front office",
    desc: "Intelbase answers leads, books calls, sends follow-ups and runs ads while you focus on the work.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="lp-sec" id="how">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow"><span className="lp-dot" />How it works</span>
          <h2 className="lp-h2">Live in three steps</h2>
          <p className="lp-lede">From sign up to a fully running front office. No technical team required.</p>
        </div>

        <div className="lp-steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                className="lp-step"
                key={s.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              >
                <div className="lp-step-n">{s.n}</div>
                <div className="lp-step-ico"><Icon strokeWidth={1.9} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
