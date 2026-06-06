"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTimeline } from "@/lib/os-demo/use-timeline";
import { ramp } from "@/lib/os-demo/timeline";
import { CHAT, QUAL_TAGS } from "@/lib/os-demo/fixtures";
import { Panel } from "@/components/os/ui/frame";
import { Sparkline } from "@/components/os/ui/sparkline";
import { wobble, climb, gauge01 } from "@/lib/os-demo/telemetry";
import "./concierge.css";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Deterministic roster of concurrent conversations (left rail) ──────────────
type Channel = "web" | "wa" | "ig";
interface Convo {
  id: string;
  name: string;
  snippet: string;
  channel: Channel;
  ago: string;
  unread?: number;
  typing?: boolean;
  seed: number; // drives live "ago" wobble feel
}

const CONVOS: Convo[] = [
  { id: "harbour", name: "Harbour Dental", snippet: "Sure, Friday afternoon works.", channel: "web", ago: "now", typing: false, seed: 1 },
  { id: "kowloon", name: "Kowloon Physio", snippet: "What are your monthly rates?", channel: "wa", ago: "12s", unread: 2, typing: true, seed: 2 },
  { id: "central", name: "Central Law Co", snippet: "Can you handle after-hours intake?", channel: "web", ago: "34s", unread: 1, seed: 3 },
  { id: "saiying", name: "Sai Ying Pun Cafe", snippet: "Do you support Cantonese?", channel: "ig", ago: "1m", typing: true, seed: 4 },
  { id: "tsim", name: "Tsim Sha Tsui Spa", snippet: "Great, send me the calendar link.", channel: "wa", ago: "2m", seed: 5 },
  { id: "wanchai", name: "Wanchai Realty", snippet: "We get ~60 enquiries a week.", channel: "web", ago: "3m", unread: 4, seed: 6 },
  { id: "mongkok", name: "Mong Kok Optical", snippet: "Is there a setup fee?", channel: "ig", ago: "4m", seed: 7 },
  { id: "quarry", name: "Quarry Bay Vet", snippet: "Booked. Thanks for the help.", channel: "web", ago: "6m", seed: 8 },
  { id: "northpt", name: "North Point Gym", snippet: "Can it follow up by SMS?", channel: "wa", ago: "8m", unread: 1, typing: true, seed: 9 },
];

const CHANNEL_LABEL: Record<Channel, string> = { web: "Web", wa: "WhatsApp", ig: "Instagram" };

// Detected intents with confidence (static + a touch of live drift, clamped).
const INTENTS: { label: string; base: number; seed: number }[] = [
  { label: "Pricing", base: 0.94, seed: 11 },
  { label: "After-hours coverage", base: 0.88, seed: 12 },
  { label: "Dental vertical", base: 0.76, seed: 13 },
  { label: "Language support", base: 0.63, seed: 14 },
];

function ChannelIcon({ channel }: { channel: Channel }) {
  return (
    <span className={`cc-chan cc-chan-${channel}`} aria-hidden>
      <span className="cc-chan-glyph" />
    </span>
  );
}

export function Concierge() {
  const { state } = useTimeline();
  const t = state.t;

  const messages = CHAT.filter((m) => m.at <= t);

  // Typing indicator: the next unreleased message is an AI message landing soon.
  const typing = CHAT.some(
    (m) => m.who === "ai" && t < m.at && m.at <= t + 1.5,
  );

  // Lead score fills 0..1 over 4s once qualification fires (t=20).
  const score = ramp(t, 20, 4);
  const qualified = state.has("lead-qualified");
  const booked = state.has("call-booked");

  // ── Live telemetry ──────────────────────────────────────────────────────────
  const open = Math.round(wobble(21, t, 9, 0.9, 0.5)); // ~9 open
  const waiting = Math.round(Math.abs(wobble(22, t, 2, 0.8, 0.7))); // ~2 waiting
  const convoToday = Math.floor(climb(t, 1148, 0.35, 31, 0)); // conversations today
  const avgResp = wobble(40, t, 2.8, 0.35, 0.6); // seconds
  const bookedToday = Math.floor(climb(t, 22, 0.05, 5, 0)); // booked today
  const handledToday = Math.floor(climb(t, 1184, 0.4, 17, 0)); // messages handled

  // Response-time sparkline series (deterministic, last ~24 ticks).
  const respSeries = Array.from({ length: 24 }, (_, i) => {
    const tt = t - (23 - i) * 0.7;
    return wobble(40, tt, 2.8, 0.4, 0.6);
  });

  return (
    <div className="os-concierge cc-shell">
      <header className="os-screen-head">
        <div>
          <h2 className="os-screen-title">Concierge</h2>
          <p className="os-screen-sub">Answering and qualifying every visitor, live</p>
        </div>
        <div className="os-status-pill">
          <span className="os-status-dot" />
          {avgResp.toFixed(1)}s avg response
        </div>
      </header>

      {/* Top stat strip across the whole screen */}
      <div className="cc-strip">
        <div className="cc-strip-cell">
          <span className="cc-strip-label">Conversations today</span>
          <span className="cc-strip-val cc-mono">{convoToday.toLocaleString("en-US")}</span>
        </div>
        <div className="cc-strip-cell">
          <span className="cc-strip-label">Avg response</span>
          <span className="cc-strip-val cc-mono">{avgResp.toFixed(1)}s</span>
        </div>
        <div className="cc-strip-cell">
          <span className="cc-strip-label">Resolution rate</span>
          <span className="cc-strip-val cc-mono">91%</span>
        </div>
        <div className="cc-strip-cell">
          <span className="cc-strip-label">Booked today</span>
          <span className="cc-strip-val cc-mono">{bookedToday.toLocaleString("en-US")}</span>
        </div>
        <div className="cc-strip-cell">
          <span className="cc-strip-label">Languages</span>
          <span className="cc-strip-val cc-mono">EN / zh-HK</span>
        </div>
      </div>

      <div className="cc-grid">
        {/* ── LEFT: Active conversations ─────────────────────────────────────── */}
        <Panel title="Active conversations" tag="LIVE" className="cc-convos-panel">
          <div className="cc-convo-stats">
            <span className="cc-cs cc-cs-open">
              <em className="cc-cs-dot" /> Open <b className="cc-mono">{open}</b>
            </span>
            <span className="cc-cs cc-cs-wait">
              <em className="cc-cs-dot" /> Waiting <b className="cc-mono">{waiting}</b>
            </span>
          </div>
          <div className="cc-convo-list">
            {CONVOS.map((c) => (
              <div
                key={c.id}
                className={`cc-convo ${c.id === "harbour" ? "cc-convo-active" : ""}`}
              >
                <ChannelIcon channel={c.channel} />
                <div className="cc-convo-body">
                  <div className="cc-convo-top">
                    <span className="cc-convo-name">{c.name}</span>
                    <span className="cc-convo-ago cc-mono">{c.ago}</span>
                  </div>
                  <div className="cc-convo-bottom">
                    {c.typing ? (
                      <span className="cc-convo-typing">
                        <span className="cc-mini-dot" />
                        <span className="cc-mini-dot" />
                        <span className="cc-mini-dot" />
                        <span className="cc-convo-typing-label">typing</span>
                      </span>
                    ) : (
                      <span className="cc-convo-snip">{c.snippet}</span>
                    )}
                    <span className="cc-convo-meta">
                      <span className="cc-convo-chan-label">{CHANNEL_LABEL[c.channel]}</span>
                      {c.unread ? (
                        <span className="cc-convo-unread cc-mono">{c.unread}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── CENTER: hero thread (kept) ─────────────────────────────────────── */}
        <Panel title="Harbour Dental" tag="LIVE" className="os-cc-chat-panel cc-chat-panel">
          <div className="cc-chat-sub">
            <span className="cc-chip">
              <span className="cc-chip-glyph" /> Web
            </span>
            <span className="cc-chip">Hong Kong</span>
            <span className="cc-chip cc-chip-live">
              <span className="cc-chip-pulse" /> response {avgResp.toFixed(1)}s
            </span>
          </div>
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

        {/* ── RIGHT: qualification + intents + metrics + booking ─────────────── */}
        <div className="os-cc-rail cc-rail">
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
                    t >= 20 + i * 0.6 ? (
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

          <Panel title="Detected intents" className="cc-intents-panel">
            <div className="cc-intents">
              {INTENTS.map((it) => {
                // small live drift around base, clamped to a believable band
                const drift = gauge01(it.seed, t, -0.02, 0.02, 0.5);
                const conf = Math.max(0.05, Math.min(0.99, it.base + drift));
                return (
                  <div key={it.label} className="cc-intent">
                    <div className="cc-intent-head">
                      <span className="cc-intent-label">{it.label}</span>
                      <span className="cc-intent-conf cc-mono">{conf.toFixed(2)}</span>
                    </div>
                    <div className="cc-intent-track">
                      <div
                        className="cc-intent-fill"
                        style={{ width: `${Math.round(conf * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Conversation metrics" className="cc-metrics-panel">
            <div className="cc-metrics">
              <div className="cc-metric cc-metric-wide">
                <div className="cc-metric-head">
                  <span className="cc-metric-label">Response time</span>
                  <span className="cc-metric-val cc-mono">{avgResp.toFixed(1)}s</span>
                </div>
                <Sparkline points={respSeries} color="#6ea8ff" w={220} h={34} />
              </div>
              <div className="cc-metric">
                <span className="cc-metric-label">Sentiment</span>
                <span className="cc-metric-val cc-pos">Positive</span>
              </div>
              <div className="cc-metric">
                <span className="cc-metric-label">Handled today</span>
                <span className="cc-metric-val cc-mono">
                  {handledToday.toLocaleString("en-US")}
                </span>
              </div>
              <div className="cc-metric">
                <span className="cc-metric-label">Languages</span>
                <span className="cc-metric-val cc-mono">EN / zh-HK</span>
              </div>
              <div className="cc-metric">
                <span className="cc-metric-label">Handoff rate</span>
                <span className="cc-metric-val cc-mono">3%</span>
              </div>
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
