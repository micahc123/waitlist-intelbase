"use client";

import { Icon } from "@/components/icons";

type IconName = "bolt" | "node" | "sparkles" | "brain";

const kpis: { icon: IconName; val: string; unit: string; label: string }[] = [
  { icon: "bolt", val: "50", unit: "+", label: "Businesses automated end-to-end" },
  { icon: "node", val: "24", unit: "h", label: "Flat quote turnaround" },
  { icon: "sparkles", val: "4.9", unit: "/5", label: "Average client rating" },
  { icon: "brain", val: "06", unit: "", label: "Spots open this month" },
];

const cases = [
  {
    quote: "Paid for itself in six weeks. Replaced three SaaS tools and a VA.",
    name: "Eric Hong",
    role: "CEO · FindYourCareer",
    avatar: "EH",
  },
  {
    quote: "Live the day after our call. Cold email replies doubled the next week.",
    name: "Timothy Chen",
    role: "Global Sales · VIA Tech",
    avatar: "TC",
  },
  {
    quote: "Wasted six months on a custom build. They shipped our RAG in 72 hours.",
    name: "Trenton Johnson",
    role: "Founder · BizGenius",
    avatar: "TJ",
  },
];

export function KPIs() {
  return (
    <section className="section" id="work">
      <div className="section-head reveal">
        <span className="section-tag">By the numbers</span>
        <h2 className="section-title">
          Real systems. <span className="accent">Real ROI.</span>
        </h2>
        <p className="section-sub">
          Founders who stopped shipping demos and started shipping systems that
          actually run their business.
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
          From trial to <span className="accent">true ROI.</span>
        </h2>
        <p className="section-sub">
          Three founders. Three systems. Zero retainers, zero seat fees, zero
          &ldquo;let&apos;s circle back.&rdquo; Just shipped.
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
