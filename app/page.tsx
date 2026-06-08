import Image from "next/image";
import WaitlistForm from "./waitlist-form";

// Signature intelbase visual: the agent constellation (a glowing core with
// satellite agents) sitting inside a floating "command plane" mock, mirroring
// the marketing site's hero.
function CommandGraph() {
  const nodes = [
    { x: 250, y: 130, r: 26, c: "#6ea8ff" },
    { x: 110, y: 70, r: 13, c: "#6ea8ff" },
    { x: 400, y: 78, r: 13, c: "#6ea8ff" },
    { x: 92, y: 210, r: 13, c: "#7df5c8" },
    { x: 415, y: 205, r: 13, c: "#6ea8ff" },
    { x: 250, y: 250, r: 13, c: "#6ea8ff" },
    { x: 180, y: 40, r: 8, c: "#b79cff" },
    { x: 330, y: 250, r: 8, c: "#6ea8ff" },
  ];
  return (
    <svg
      className="graph"
      viewBox="0 0 500 300"
      role="img"
      aria-label="Agent constellation"
    >
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a9caff" />
          <stop offset="100%" stopColor="#4d83e6" />
        </radialGradient>
      </defs>
      <g stroke="rgba(110,168,255,0.35)" strokeWidth="1" fill="none">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={250} y1={130} x2={n.x} y2={n.y} />
        ))}
      </g>
      {nodes.slice(1).map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.c}
          fillOpacity={0.9}
          className="sat"
          style={{
            filter: `drop-shadow(0 0 8px ${n.c})`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      <circle
        cx={250}
        cy={130}
        r={38}
        fill="none"
        stroke="rgba(110,168,255,0.25)"
        strokeWidth="1"
      />
      <circle
        cx={250}
        cy={130}
        r={26}
        fill="url(#core)"
        className="core"
        style={{ filter: "drop-shadow(0 0 22px rgba(110,168,255,0.9))" }}
      />
    </svg>
  );
}

const FEED = [
  { c: "#7df5c8", label: "Lead captured", meta: "website concierge · 0:03s" },
  { c: "#6ea8ff", label: "Call booked", meta: "Friday 2:00pm · auto-confirmed" },
  { c: "#b79cff", label: "Follow-up sent", meta: "nurture sequence resumed" },
];

export default function Home() {
  return (
    <>
      <div className="field" aria-hidden>
        <div className="glow" />
        <div className="grid" />
      </div>

      <nav>
        <div className="brand">
          <Image
            src="/intelbase-logo.webp"
            alt="intelbase logo"
            width={34}
            height={34}
            priority
          />
          intelbase
        </div>
        <span className="nav-tag">Private beta</span>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <div className="pill">
            <span className="dot" />
            The AI operating system for business
          </div>

          <h1>
            An AI operating system that{" "}
            <span className="grad">runs your business.</span>
          </h1>

          <p className="sub">
            Connect your tools once. intelbase answers every lead, books your
            calls, runs your follow-ups and ads, then reports back on one live
            dashboard. <b>Every action waits for your approval</b> until you
            trust it to run on its own.
          </p>

          <WaitlistForm />
        </div>

        <div className="hero-mock" aria-hidden>
          <div className="mock">
            <div className="mock-bar">
              <i />
              <i />
              <i />
              <span>INTELBASE / COMMAND PLANE</span>
            </div>
            <div className="mock-stage">
              <CommandGraph />
            </div>
            <div className="feed">
              {FEED.map((f) => (
                <div className="feed-row" key={f.label}>
                  <span className="feed-dot" style={{ background: f.c }} />
                  <span className="feed-label">{f.label}</span>
                  <span className="feed-meta">{f.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <footer>
        © 2026 intelbase. The autonomous AI operating system for your business.
      </footer>
    </>
  );
}
