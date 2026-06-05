"use client";

import { Icon } from "@/components/icons";

type IconName = "bolt" | "node" | "sparkles" | "brain";

const kpis: { icon: IconName; val: string; unit: string; label: string }[] = [
  { icon: "bolt", val: "24", unit: "/7", label: "Every visitor answered in seconds" },
  { icon: "node", val: "0", unit: " hires", label: "Front office that runs itself" },
  { icon: "sparkles", val: "30", unit: "-50", label: "Ad variations tested per month" },
  { icon: "brain", val: "06", unit: "", label: "Spots open this month" },
];

const cases = [
  {
    quote:
      "The chat on this site is the product. We talk to intelbase OS before we talk to a human, and so do our clients. It answers, qualifies, and books, and hands off when it is unsure.",
    name: "Eric Hong",
    role: "Founder · FindYourCareer",
    avatar: "EH",
  },
  {
    quote:
      "Our front office basically runs itself now. Visitors get answered in seconds, calls land on the calendar overnight, and I did not have to hire a sales rep to make it happen.",
    name: "Timothy Chen",
    role: "Head of Growth · VIA Tech",
    avatar: "TC",
  },
  {
    quote:
      "What sold me was the guardrails. It never invents a price or makes a promise it cannot keep. The moment it is unsure, it pulls me in. So I actually trust it to run on its own.",
    name: "Trenton Johnson",
    role: "Founder · BizGenius",
    avatar: "TJ",
  },
];

export function KPIs() {
  return (
    <section className="section" id="work">
      <div className="section-head reveal">
        <span className="section-tag">Proof it works</span>
        <h2 className="section-title">
          The chat on this site <span className="accent">is the product.</span>
        </h2>
        <p className="section-sub">
          You are talking to intelbase OS right now. The same OS we run for
          clients answers visitors, qualifies leads, and books calls, on its own.
        </p>
      </div>
      <div className="kpis reveal">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-icon">
              <Icon name={k.icon} />
            </div>
            <div className="kpi-val">
              {k.val}
              <span className="unit">{k.unit}</span>
            </div>
            <div className="kpi-lbl">{k.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section alt">
      <div className="section-head reveal">
        <span className="section-tag">What founders say</span>
        <h2 className="section-title">
          A front office <span className="accent">that runs itself.</span>
        </h2>
        <p className="section-sub">
          Founders who handed their front office to intelbase OS and let it
          answer, qualify, and book, autonomously, with guardrails they trust.
        </p>
      </div>
      <div className="testimonials reveal">
        {cases.map((c) => (
          <article className="case" key={c.name}>
            <div className="case-stars">★★★★★</div>
            <p className="case-quote">&ldquo;{c.quote}&rdquo;</p>
            <div className="case-author">
              <div className="case-avatar">{c.avatar}</div>
              <div>
                <div className="name">{c.name}</div>
                <div className="role">{c.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Proof() {
  return (
    <>
      <KPIs />
      <Testimonials />
    </>
  );
}
