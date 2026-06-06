"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { ramp } from "@/lib/os-demo/timeline";
import { CHAT, QUAL_TAGS } from "@/lib/os-demo/fixtures";
import { Panel } from "@/components/os/ui/frame";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Concierge() {
  const { state } = useTimeline();

  const messages = CHAT.filter((m) => m.at <= state.t);

  // Typing indicator: the next unreleased message is an AI message landing soon.
  const typing = CHAT.some(
    (m) => m.who === "ai" && state.t < m.at && m.at <= state.t + 1.5,
  );

  // Lead score fills 0..1 over 4s once qualification fires (t=20).
  const score = ramp(state.t, 20, 4);
  const qualified = state.has("lead-qualified");
  const booked = state.has("call-booked");

  return (
    <div className="os-concierge">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Concierge</h2>
          <p className="os-screen-sub">Answering and qualifying every visitor, live</p>
        </div>
        <div className="os-status-pill">
          <span className="os-status-dot" />
          Responding in 3s avg
        </div>
      </header>

      <div className="os-cc-grid">
        <Panel title="harbourdental.com visitor" tag="LIVE" className="os-cc-chat-panel">
          <div className="os-cc-thread">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.at}
                  className={`os-cc-row os-cc-${m.who}`}
                  initial={{ opacity: 0, y: 8, x: m.who === "ai" ? 14 : -14 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <span className={`os-cc-avatar os-cc-avatar-${m.who}`} />
                  <div className="os-cc-bubble-wrap">
                    <span className="os-cc-sender">
                      {m.who === "ai" ? "Concierge" : "Visitor"}
                    </span>
                    <div className={`os-cc-bubble os-cc-bubble-${m.who}`}>{m.text}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {typing && (
                <motion.div
                  key="typing"
                  className="os-cc-row os-cc-ai"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <span className="os-cc-avatar os-cc-avatar-ai" />
                  <div className="os-cc-bubble-wrap">
                    <span className="os-cc-sender">Concierge</span>
                    <div className="os-cc-bubble os-cc-bubble-ai os-cc-typing">
                      <span className="os-cc-dot" />
                      <span className="os-cc-dot" />
                      <span className="os-cc-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Panel>

        <div className="os-cc-rail">
          <Panel title="Live qualification" className="os-cc-qual-panel">
            <div className="os-cc-score">
              <div className="os-cc-score-head">
                <span className="os-cc-score-label">Lead score</span>
                <AnimatePresence>
                  {score >= 1 && (
                    <motion.span
                      className="os-cc-score-verdict"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      Strong fit
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="os-cc-score-track">
                <div
                  className="os-cc-score-fill"
                  style={{ width: `${Math.round(score * 100)}%` }}
                />
              </div>
            </div>

            <div className="os-cc-tags">
              <AnimatePresence>
                {qualified &&
                  QUAL_TAGS.map((tag, i) =>
                    state.t >= 20 + i * 0.6 ? (
                      <motion.span
                        key={tag}
                        className="os-cc-tag"
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        <span className="os-cc-check" />
                        {tag}
                      </motion.span>
                    ) : null,
                  )}
              </AnimatePresence>
            </div>
          </Panel>

          <AnimatePresence>
            {booked && (
              <motion.div
                className="os-cc-booking"
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="os-cc-cal-glyph" />
                <div className="os-cc-booking-copy">
                  <strong>Call booked</strong>
                  <span className="os-cc-booking-when">Friday 3:00pm</span>
                  <span className="os-cc-booking-sub">Confirmation sent</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
