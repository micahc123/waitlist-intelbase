const steps = [
  {
    n: "01",
    title: "Discover & Diagnose",
    sub: "Understand first, automate second.",
    bullets: [
      "We learn how your business actually works: goals, constraints, handoffs, and what a 'win' looks like.",
      "We map your tech stack and where data lives: CRMs, inboxes, spreadsheets, internal tools.",
      "We audit processes to find real bottlenecks and decide what should and shouldn't be automated.",
    ],
  },
  {
    n: "02",
    title: "Design, Build & Validate",
    sub: "Custom solutions, tested before launch.",
    bullets: [
      "We prioritize high-impact opportunities and decide where AI helps, and where it doesn't.",
      "We design and build custom workflows, test different approaches on real data, and explain our choices in plain language.",
      "We run evaluations in a real-world environment before full rollout.",
    ],
  },
  {
    n: "03",
    title: "Launch, Monitor & Optimize",
    sub: "Continuous improvement, not a one-off project.",
    bullets: [
      "We launch into production with clear success metrics and safeguards.",
      "We monitor performance, collect feedback from your team and customers, and fix issues quickly.",
      "We continuously refine prompts, logic, and models so the system improves as your business evolves.",
    ],
  },
];

export function Process() {
  return (
    <section className="section alt" id="process">
      <div className="section-head reveal">
        <span className="section-tag">Our Process</span>
        <h2 className="section-title">
          A <span className="accent">methodical</span>, low-risk approach.
        </h2>
        <p className="section-sub">
          We start with understanding your business — not jumping straight into
          tools.
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
