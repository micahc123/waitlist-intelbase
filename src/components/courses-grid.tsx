"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, BookOpen, Loader2 } from "lucide-react";
import { EBOOKS, type Ebook } from "@/lib/ebooks";

const ACCENTS: Record<
  Ebook["accent"],
  {
    border: string;
    glow: string;
    icon: string;
    check: string;
  }
> = {
  blue: {
    border: "border-blue-500/25 hover:border-blue-500/45",
    glow: "bg-blue-500/[0.08]",
    icon: "text-blue-300",
    check: "text-blue-400",
  },
  violet: {
    border: "border-violet-500/25 hover:border-violet-500/45",
    glow: "bg-violet-500/[0.08]",
    icon: "text-violet-300",
    check: "text-violet-400",
  },
  emerald: {
    border: "border-emerald-500/25 hover:border-emerald-500/45",
    glow: "bg-emerald-500/[0.08]",
    icon: "text-emerald-300",
    check: "text-emerald-400",
  },
};

export function CoursesGrid() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center px-6 pt-20 pb-8">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-[50%] bg-blue-600/[0.07] blur-[110px]" />
      </div>
      <div className="pointer-events-none absolute -right-20 top-1/2 h-[350px] w-[450px] rounded-full bg-violet-500/[0.05] blur-[90px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400">
            Field notes, not theory
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Playbooks from the lab.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-neutral-400">
            Distilled from the exact systems we ship for clients.
            Prompts, workflows, and stacks that actually work.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {EBOOKS.map((ebook, i) => (
            <EbookCard key={ebook.slug} ebook={ebook} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-center text-[11px] text-neutral-500"
        >
          Instant access after payment · Read online · Lifetime updates
        </motion.p>
      </div>
    </section>
  );
}

function EbookCard({ ebook, index }: { ebook: Ebook; index: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = ACCENTS[ebook.accent];

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ebook.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0e0f12] p-5 transition-all duration-300 ${accent.border}`}
    >
      <div
        className={`pointer-events-none absolute -left-20 -top-20 h-[220px] w-[220px] rounded-full blur-[70px] ${accent.glow}`}
      />

      <div className="relative flex h-full flex-col">
        <div
          className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white/[0.03] ${accent.border}`}
        >
          <BookOpen className={`h-4 w-4 ${accent.icon}`} />
        </div>

        <h3 className="text-[17px] font-medium tracking-tight text-white">
          {ebook.title}
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-400">
          {ebook.description}
        </p>

        <ul className="mt-4 space-y-1.5">
          {ebook.bullets.slice(0, 3).map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-[12px] leading-snug text-neutral-300"
            >
              <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent.check}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4 mt-5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight text-white">
                ${ebook.priceUsd}
              </span>
              <span className="text-xs text-neutral-500">USD</span>
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              {ebook.pages} pages · Digital
            </p>
          </div>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-black transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting
              </>
            ) : (
              <>
                Buy ebook
                <ArrowUpRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-right text-[11px] text-rose-400">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
