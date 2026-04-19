import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Showcase — Intelbase",
  description:
    "Three live products built with the exact stacks and playbooks we sell. Each one pairs with an ebook.",
};

const PROJECTS = [
  {
    slug: "reelcraft",
    name: "Reelcraft",
    tagline: "Your next 30 reels, already made.",
    blurb:
      "AI content studio. Claude writes the script, Higgsfield shoots it, we post it. Pairs with the Social Ads Playbook.",
    tint: "from-cyan-500/25 via-sky-600/10 to-transparent",
    accent: "text-cyan-300",
    accentBg: "bg-cyan-400",
  },
  {
    slug: "autopilot",
    name: "Autopilot",
    tagline: "Your business, running itself.",
    blurb:
      "AI operations for small teams — leads, CRM, outreach, reporting. Pairs with the AI Automation Playbook.",
    tint: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
    accent: "text-violet-300",
    accentBg: "bg-violet-400",
  },
  {
    slug: "atelier",
    name: "Atelier Noir",
    tagline: "The website they'll remember.",
    blurb:
      "A two-person design studio shipping premium sites in 10 days. Pairs with the Website Builder's Playbook.",
    tint: "from-emerald-500/25 via-teal-500/10 to-transparent",
    accent: "text-emerald-300",
    accentBg: "bg-emerald-400",
  },
];

export default function ShowcasePage() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <TopNav />
      <main className="relative z-10">
        <section className="relative px-6 pt-36 pb-24 sm:pt-44 sm:pb-32">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-[50%] bg-blue-600/[0.07] blur-[110px]" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
                We built the thing before we sold the playbook
              </p>
              <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
                Three products we run.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-400">
                Each one is a real brand, a real pipeline, and a real customer
                base. Each one pairs with one of our ebooks.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PROJECTS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/showcase/${p.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0f12] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15]"
                >
                  <div
                    className={`pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-[90px] opacity-70 bg-gradient-to-br ${p.tint}`}
                  />
                  <div className="relative">
                    <div className="mb-8 flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${p.accentBg}`}
                      />
                      <span
                        className={`text-[10.5px] font-semibold uppercase tracking-[0.25em] ${p.accent}`}
                      >
                        Case / 0{PROJECTS.indexOf(p) + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      {p.name}
                    </h3>
                    <p
                      className={`mt-2 text-[14px] font-medium ${p.accent}`}
                    >
                      {p.tagline}
                    </p>
                    <p className="mt-5 text-[13.5px] leading-[1.7] text-neutral-400">
                      {p.blurb}
                    </p>

                    <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-5 text-[12px] text-neutral-400">
                      <span className="uppercase tracking-[0.2em]">
                        Visit site
                      </span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <p className="mt-12 text-center text-[13px] text-neutral-500">
              Not mockups. Real sites. Screenshot them, share them, bookmark them.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
