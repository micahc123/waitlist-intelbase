"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "What exactly is Intelbase?",
    a: "Intelbase is an AI operating system that runs your front office and growth. Once your tools are connected, it answers leads, books calls, runs follow-ups and ads, and reports everything on one living dashboard, so the busywork runs itself.",
  },
  {
    q: "Do I need technical skills to set it up?",
    a: "No. Connecting your inbox, calendar, CRM, ads and chat takes a few clicks with no code and no migration. If you can use the tools you already have, you can run Intelbase.",
  },
  {
    q: "What can it connect to?",
    a: "Intelbase plugs into the tools most teams already run, including email, calendars, CRMs, ad platforms, payments and chat. You connect what you use and Intelbase works across all of it from one place.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your data stays yours. Connections use secure, permissioned access, everything is encrypted in transit and at rest, and you stay in control with guardrails you set on what each agent is allowed to do.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime. Plans are month to month or annual, with no long contracts. Cancel from your account whenever you like and you keep access through the end of your billing period.",
  },
  {
    q: "How does the free trial work?",
    a: "Every plan starts with a 14-day free trial. You can look around with no card required, connect your tools and see Intelbase run before you decide. Add a card whenever you are ready to keep going.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="lp-sec" id="faq">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <span className="lp-eyebrow"><span className="lp-dot" />FAQ</span>
          <h2 className="lp-h2">Questions, answered</h2>
        </div>

        <div className="lp-faq-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className="lp-faq-item" data-open={isOpen} key={item.q}>
                <button
                  className="lp-faq-q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <Plus />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="lp-faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
