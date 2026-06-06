"use client";

import { motion } from "motion/react";
import { EXPANSION } from "@/lib/os-demo/fixtures";

// Per-card visual config: icon gradient tint + description (no em dashes)
const CARD_META: Record<string, { grad: string; desc: string }> = {
  "AI Voice Receptionist": {
    grad: "linear-gradient(135deg, #6ea8ff, #b79cff)",
    desc: "Answers and qualifies phone calls, then books them",
  },
  "AI Inbox Manager": {
    grad: "linear-gradient(135deg, #7df5c8, #6ea8ff)",
    desc: "Triages inbound email and DMs and drafts replies",
  },
  "Multilingual Front Desk": {
    grad: "linear-gradient(135deg, #b79cff, #ff8fb1)",
    desc: "Serves visitors in English, Cantonese, and Mandarin",
  },
  "Quote & Proposal Builder": {
    grad: "linear-gradient(135deg, #ffd166, #ff8fb1)",
    desc: "Turns a conversation into a tailored quote",
  },
  "Reactivation Engine": {
    grad: "linear-gradient(135deg, #7df5c8, #ffd166)",
    desc: "Re-engages dormant leads on its own",
  },
  "Market & Competitor Watch": {
    grad: "linear-gradient(135deg, #6ea8ff, #ffd166)",
    desc: "Monitors signals and sends short summaries",
  },
};

export function Modules() {
  return (
    <div className="os-modules">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Modules</h2>
          <p className="os-screen-sub">Switch on new capabilities as you grow</p>
        </div>
        <div className="os-status-pill os-status-pill-violet">
          <span className="os-status-dot os-status-dot-violet" />
          4 of 6 active
        </div>
      </header>

      <div className="os-modules-grid">
        {EXPANSION.map((mod, i) => {
          const meta = CARD_META[mod.name] ?? {
            grad: "linear-gradient(135deg, #6ea8ff, #b79cff)",
            desc: "",
          };
          return (
            <motion.div
              key={mod.name}
              className={`os-module-card${mod.on ? " os-module-card-on" : " os-module-card-off"}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="os-module-icon"
                style={{ background: meta.grad }}
              />
              <div className="os-module-body">
                <span className="os-module-name">{mod.name}</span>
                <span className="os-module-desc">{meta.desc}</span>
              </div>
              <div className={`os-module-toggle${mod.on ? " os-module-toggle-on" : " os-module-toggle-off"}`}>
                <span className="os-module-toggle-knob" />
                <span className="os-module-toggle-label">
                  {mod.on ? "On" : "Off"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
