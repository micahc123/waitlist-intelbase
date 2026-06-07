"use client";

import { motion } from "motion/react";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";

const NODES = [
  { x: 250, y: 130, r: 26, c: "#6ea8ff", label: "Core" },
  { x: 110, y: 70, r: 13, c: "#6ea8ff" },
  { x: 400, y: 78, r: 13, c: "#6ea8ff" },
  { x: 92, y: 210, r: 13, c: "#7df5c8" },
  { x: 415, y: 205, r: 13, c: "#6ea8ff" },
  { x: 250, y: 250, r: 13, c: "#6ea8ff" },
  { x: 180, y: 40, r: 8, c: "#b79cff" },
  { x: 330, y: 250, r: 8, c: "#6ea8ff" },
];

const EDGES = [1, 2, 3, 4, 5, 6, 7];

function CommandGraph() {
  return (
    <svg className="lp-mock-graph" viewBox="0 0 500 300" role="img" aria-label="Agent constellation">
      <defs>
        <radialGradient id="lpCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a9caff" />
          <stop offset="100%" stopColor="#4d83e6" />
        </radialGradient>
      </defs>
      {/* edges from core to each satellite */}
      <g stroke="rgba(110,168,255,0.35)" strokeWidth="1" fill="none">
        {EDGES.map((i) => (
          <line key={i} x1={250} y1={130} x2={NODES[i].x} y2={NODES[i].y} />
        ))}
      </g>
      {/* satellites */}
      {NODES.slice(1).map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.c}
          fillOpacity={0.9}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${n.c})` }}
        />
      ))}
      {/* core */}
      <motion.circle
        cx={250}
        cy={130}
        r={26}
        fill="url(#lpCore)"
        animate={{ r: [26, 28, 26] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 22px rgba(110,168,255,0.9))" }}
      />
      <circle cx={250} cy={130} r={38} fill="none" stroke="rgba(110,168,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

const FEED = [
  { c: "#7df5c8", text: <><b>Lead captured</b> from website concierge &middot; 0:03s</> },
  { c: "#6ea8ff", text: <><b>Call booked</b> for Friday 2:00pm &middot; auto-confirmed</> },
  { c: "#b79cff", text: <><b>Follow-up sent</b> &middot; nurture sequence resumed</> },
];

export function LandingHero() {
  return (
    <header className="lp-hero">
      <div className="lp-wrap lp-hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="lp-eyebrow"><span className="lp-dot" />The AI operating system for business</span>

          <h1 className="lp-hero-h1">
            An AI operating system that <span className="lp-grad">runs your business.</span>
          </h1>

          <p className="lp-hero-sub">
            Connect your tools once. Intelbase answers every lead, books your calls, runs your
            follow-ups and ads, then reports back on one live dashboard. Every action waits for
            your approval until you trust it to run on its own.
          </p>

          <div className="lp-hero-cta">
            <a href="/signup" className="lp-btn lp-btn-primary">Start free trial <ArrowRight /></a>
            <a href="#how" className="lp-btn lp-btn-ghost"><Play /> See how it works</a>
          </div>

          <div className="lp-hero-reassure">
            <ShieldCheck /> 14-day free trial. Look around with no card required.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <motion.div
            className="lp-mock"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="lp-mock-glow" />
            <div className="lp-mock-bar">
              <i /><i /><i />
              <span>INTELBASE / COMMAND PLANE</span>
            </div>

            <div className="lp-mock-stage">
              <CommandGraph />
            </div>

            <div className="lp-mock-chips">
              <div className="lp-chip">
                <div className="lp-chip-label">Leads today</div>
                <div className="lp-chip-val b">128</div>
              </div>
              <div className="lp-chip">
                <div className="lp-chip-label">Replied</div>
                <div className="lp-chip-val m">100%</div>
              </div>
              <div className="lp-chip">
                <div className="lp-chip-label">Calls booked</div>
                <div className="lp-chip-val v">41</div>
              </div>
            </div>

            <div className="lp-mock-foot">
              <span className="lp-mock-foot-dot" />
              All actions ran with your approval rules applied
            </div>

            <div className="lp-mock-feed">
              {FEED.map((f, i) => (
                <div className="lp-feed-row" key={i}>
                  <span className="lp-pulse" style={{ background: f.c, boxShadow: `0 0 10px 1px ${f.c}` }} />
                  {f.text}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="lp-wrap lp-logos">
        <div className="lp-logos-label">Plugs into the tools you already run</div>
        <div className="lp-logos-row">
          <span>Gmail</span>
          <span>Slack</span>
          <span>HubSpot</span>
          <span>Calendly</span>
          <span>Stripe</span>
          <span>WhatsApp</span>
        </div>
      </div>
    </header>
  );
}
