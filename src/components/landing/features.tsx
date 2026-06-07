"use client";

import { motion } from "motion/react";
import { MessageSquare, Radar, Repeat, Megaphone, BrainCircuit, LayoutDashboard } from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Website Concierge",
    desc: "Greets every visitor, answers their questions, qualifies them and books the meeting before they leave the page.",
  },
  {
    icon: Radar,
    title: "Autonomous Lead Gen",
    desc: "Finds and reaches the right prospects across channels, then routes the warm ones straight into your pipeline.",
  },
  {
    icon: Repeat,
    title: "Lead Nurture on Autopilot",
    desc: "Every lead gets the right follow-up at the right moment, so nobody goes cold and nothing slips through.",
  },
  {
    icon: Megaphone,
    title: "AI Ad Engine",
    desc: "Launches, watches and tunes campaigns toward booked calls, not vanity clicks, inside the budget guardrails you set.",
  },
  {
    icon: BrainCircuit,
    title: "Memory Cortex",
    desc: "Remembers and sorts every conversation, contact and decision, so the whole system acts on shared context.",
  },
  {
    icon: LayoutDashboard,
    title: "One Command Dashboard",
    desc: "A single live view of leads, calls, follow-ups and ad spend, with every agent reporting in real time.",
  },
];

export function LandingFeatures() {
  return (
    <section className="lp-sec" id="product">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow"><span className="lp-dot" />The operating system</span>
          <h2 className="lp-h2">One system that runs the whole front office</h2>
          <p className="lp-lede">
            A constellation of agents working together, with a shared memory and a single place to watch it all.
          </p>
        </div>

        <div className="lp-feat-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                className="lp-feat"
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
              >
                <div className="lp-feat-ico"><Icon strokeWidth={1.9} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
