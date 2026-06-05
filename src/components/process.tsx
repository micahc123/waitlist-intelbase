const steps = [
  {
    n: "01",
    title: "Map",
    sub: "We learn your business and your rules.",
    bullets: [
      "We learn your offers, your voice, and how you sell.",
      "We set the rules: what the OS can say and what it must never guess at.",
      "We define when it should hand off to you instead of going off-script.",
    ],
  },
  {
    n: "02",
    title: "Build",
    sub: "We configure the OS on your stack.",
    bullets: [
      "We configure the OS and wire it to your site, ads, and calendar.",
      "We connect your CRM so every conversation and lead lands in one place.",
      "We set the guardrails so it stays on-script from day one.",
    ],
  },
  {
    n: "03",
    title: "Go live, autonomously",
    sub: "It runs on its own. You watch the dashboard.",
    bullets: [
      "The OS goes live and runs the front office on its own.",
      "You watch conversations, leads, calls, and ads on one dashboard.",
      "We tune the guardrails as it works, so it keeps getting sharper.",
    ],
  },
];

export function Process() {
  return (
    <section className="section alt" id="process">
      <div className="section-head reveal">
        <span className="section-tag">Our Process</span>
        <h2 className="section-title">
          Three steps to a <span className="accent">front office that runs itself.</span>
        </h2>
        <p className="section-sub">
          We map your business, configure the OS on your stack, and switch it on.
          Then it runs autonomously while you watch the dashboard.
        </p>
      </div>
      <div className="process reveal">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <div className="step-num">{s.n}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-sub">{s.sub}</div>
            <ul className="step-bullets">
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
