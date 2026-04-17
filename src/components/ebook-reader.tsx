"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, List, ArrowUp } from "lucide-react";
import type { Ebook } from "@/lib/ebooks";
import type { EbookDoc, Block } from "@/components/ebooks/content";

const ACCENT: Record<Ebook["accent"], { fg: string; soft: string; ring: string; glow: string }> = {
  blue: {
    fg: "text-sky-300",
    soft: "bg-sky-400/10 border-sky-400/30",
    ring: "ring-sky-400/40",
    glow: "from-sky-500/25 via-blue-600/10",
  },
  violet: {
    fg: "text-violet-300",
    soft: "bg-violet-400/10 border-violet-400/30",
    ring: "ring-violet-400/40",
    glow: "from-violet-500/25 via-fuchsia-600/10",
  },
  emerald: {
    fg: "text-emerald-300",
    soft: "bg-emerald-400/10 border-emerald-400/30",
    ring: "ring-emerald-400/40",
    glow: "from-emerald-500/25 via-teal-600/10",
  },
};

export function EbookReader({
  ebook,
  content,
}: {
  ebook: Ebook;
  content: EbookDoc;
}) {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const preview = params.get("preview");
  const accent = ACCENT[ebook.accent];

  const [tocOpen, setTocOpen] = useState(false);

  const tocItems = useMemo(
    () => [
      { id: "intro", label: "Introduction", number: "00" },
      ...content.chapters.map((c, i) => ({
        id: `ch-${i}`,
        label: c.title,
        number: String(i + 1).padStart(2, "0"),
      })),
      { id: "end", label: "Colophon", number: "★" },
    ],
    [content.chapters],
  );

  const gateQuery = new URLSearchParams();
  if (sessionId) gateQuery.set("session_id", sessionId);
  if (preview) gateQuery.set("preview", preview);
  const gateSuffix = gateQuery.toString() ? `?${gateQuery.toString()}` : "";

  return (
    <div
      data-ebook-reader
      className="font-[var(--font-reader)] min-h-[100dvh] bg-[#0A0A0C] text-neutral-100"
      style={{
        fontFamily: "var(--font-reader), system-ui, sans-serif",
      }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 print:hidden">
        <div
          className={`absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-[50%] bg-gradient-to-br ${accent.glow} to-transparent blur-[110px] opacity-70`}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Toolbar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A0A0C]/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Courses
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            <span className={`hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block ${accent.fg.replace("text-", "bg-")}`} />
            <p className="truncate text-[12px] font-medium text-neutral-400">
              {ebook.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTocOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[12px] font-medium text-neutral-200 transition-colors hover:bg-white/[0.08]"
              aria-label="Table of contents"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Contents</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[12px] font-semibold text-black transition-colors hover:bg-neutral-200"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save as PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOC drawer */}
      {tocOpen && (
        <div
          className="fixed inset-0 z-40 print:hidden"
          onClick={() => setTocOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto border-l border-white/[0.08] bg-[#0D0E12] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${accent.fg}`}>
                Contents
              </p>
              <button
                onClick={() => setTocOpen(false)}
                className="text-xs text-neutral-500 hover:text-white"
              >
                Close
              </button>
            </div>
            <ul className="space-y-1">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setTocOpen(false)}
                    className="group flex items-start gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <span
                      className={`mt-0.5 font-mono text-[11px] ${accent.fg} opacity-80`}
                      style={{ fontFamily: "var(--font-reader-mono), monospace" }}
                    >
                      {item.number}
                    </span>
                    <span className="flex-1 text-[13px] font-medium leading-snug text-neutral-200 group-hover:text-white">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {/* Cover */}
      <section className="relative z-10 flex min-h-[82dvh] items-center px-6 pb-16 pt-12 sm:pt-20 print:min-h-0 print:pb-20 print:pt-10 print:break-after-page">
        <div className="mx-auto w-full max-w-3xl">
          <div className={`mb-10 h-[3px] w-14 ${accent.fg.replace("text-", "bg-")}`} />
          <p
            className={`mb-8 text-[11px] font-semibold tracking-[0.3em] ${accent.fg}`}
          >
            INTELBASE · PLAYBOOK
          </p>
          <h1 className="mb-6 text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
            {ebook.title}
          </h1>
          <p
            className={`mb-10 text-[15px] font-semibold tracking-wide ${accent.fg}`}
          >
            {ebook.subtitle}
          </p>
          <p className="max-w-xl text-[15px] leading-[1.7] text-neutral-400">
            {ebook.description}
          </p>

          <div className="mt-16 flex items-center justify-between border-t border-white/[0.06] pt-6 text-[11px] uppercase tracking-widest text-neutral-500">
            <span className="font-semibold">intelbase.co</span>
            <span>
              Ed. {new Date().getFullYear()} · {ebook.pages} pages
            </span>
          </div>
        </div>
      </section>

      {/* Contents page */}
      <section className="relative z-10 px-6 py-20 print:break-after-page print:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p
            className={`mb-4 text-[11px] font-semibold tracking-[0.25em] ${accent.fg}`}
          >
            CONTENTS
          </p>
          <h2 className="mb-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What you&apos;ll find inside.
          </h2>
          <div className={`mt-8 mb-6 h-[2px] w-10 ${accent.fg.replace("text-", "bg-")}`} />

          <ol className="divide-y divide-white/[0.06]">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-baseline gap-5 py-4 transition-colors hover:text-white"
                >
                  <span
                    className={`w-10 font-mono text-xs ${accent.fg} opacity-80`}
                    style={{ fontFamily: "var(--font-reader-mono), monospace" }}
                  >
                    {item.number}
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-neutral-200 group-hover:text-white">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Introduction */}
      <section
        id="intro"
        className="relative z-10 px-6 py-20 print:break-before-page print:py-12"
      >
        <div className="mx-auto w-full max-w-3xl">
          <p
            className={`mb-3 text-[11px] font-semibold tracking-[0.25em] ${accent.fg}`}
          >
            INTRODUCTION
          </p>
          <div className={`mb-8 h-[2px] w-10 ${accent.fg.replace("text-", "bg-")}`} />
          <p className="text-[17px] leading-[1.75] text-neutral-200 sm:text-[18px]">
            {content.intro}
          </p>
        </div>
      </section>

      {/* Chapters */}
      {content.chapters.map((ch, i) => (
        <section
          key={i}
          id={`ch-${i}`}
          className="relative z-10 px-6 py-20 print:break-before-page print:py-12"
        >
          <div className="mx-auto w-full max-w-3xl">
            {/* Chapter opener */}
            <div className="mb-10 flex items-end gap-5 sm:gap-7">
              <span
                className={`text-[76px] font-extrabold leading-none tracking-[-0.06em] sm:text-[96px] ${accent.fg}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pb-2">
                <p
                  className={`mb-2 text-[11px] font-semibold tracking-[0.25em] ${accent.fg} opacity-80`}
                >
                  CHAPTER
                </p>
                <h2 className="text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl">
                  {ch.title}
                </h2>
              </div>
            </div>

            {ch.lede && (
              <p className="mb-6 text-[17px] italic leading-[1.75] text-neutral-300 sm:text-[18px]">
                {ch.lede}
              </p>
            )}

            <div className={`mb-10 h-[2px] w-10 ${accent.fg.replace("text-", "bg-")}`} />

            <div className="space-y-5">
              {ch.blocks.map((b, j) => (
                <BlockView key={j} block={b} ebookAccent={ebook.accent} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Colophon */}
      <section
        id="end"
        className="relative z-10 flex min-h-[60vh] items-center px-6 py-20 print:break-before-page print:min-h-0 print:py-16"
      >
        <div className="mx-auto w-full max-w-2xl text-center">
          <div
            className={`mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border ${accent.soft}`}
          >
            <div
              className={`h-5 w-5 ${accent.fg.replace("text-", "bg-")}`}
            />
          </div>
          <p
            className={`mb-3 text-[11px] font-semibold tracking-[0.25em] ${accent.fg}`}
          >
            THE END
          </p>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Now go build it.
          </h2>
          <p className="mx-auto mb-2 max-w-lg text-[15px] leading-[1.7] text-neutral-400">
            If a section saved you a week or made you laugh, tell us — we&apos;ll
            trade you a cheat-sheet we haven&apos;t published yet.
          </p>
          <p className="mx-auto mb-10 max-w-lg text-[15px] leading-[1.7] text-neutral-400">
            Need this implemented for your business? We do that too.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://intelbase.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200"
            >
              intelbase.co
            </a>
            <a
              href="mailto:hello@intelbase.co"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-neutral-200 transition-all hover:bg-white/[0.08]"
            >
              hello@intelbase.co
            </a>
          </div>
          <p className="mt-12 text-[11px] uppercase tracking-widest text-neutral-600">
            © {new Date().getFullYear()} Intelbase · Licensed to the purchaser
          </p>
        </div>
      </section>

      {/* Back to top */}
      <div className="fixed bottom-6 right-6 z-30 print:hidden">
        <a
          href="#"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-[#141519]/90 text-neutral-300 shadow-xl backdrop-blur transition-colors hover:text-white"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </a>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm 18mm;
          }
          html, body {
            background: #ffffff !important;
          }
          [data-ebook-reader] {
            background: #ffffff !important;
            color: #121212 !important;
          }
          [data-ebook-reader] h1,
          [data-ebook-reader] h2,
          [data-ebook-reader] h3 {
            color: #0b0b0b !important;
          }
          [data-ebook-reader] .text-neutral-200,
          [data-ebook-reader] .text-neutral-300,
          [data-ebook-reader] .text-neutral-400 {
            color: #2a2a2a !important;
          }
          [data-ebook-reader] .text-neutral-500,
          [data-ebook-reader] .text-neutral-600 {
            color: #666 !important;
          }
          [data-ebook-reader] .text-white {
            color: #0b0b0b !important;
          }
        }
      `}</style>

      {/* gate suffix used by internal anchors not needed — kept for future */}
      <span className="hidden">{gateSuffix}</span>
    </div>
  );
}

function BlockView({
  block,
  ebookAccent,
}: {
  block: Block;
  ebookAccent: Ebook["accent"];
}) {
  const a = ACCENT[ebookAccent];
  switch (block.kind) {
    case "p":
      return (
        <p className="text-[15.5px] leading-[1.8] text-neutral-200 sm:text-[16px]">
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3 className="mt-8 text-[19px] font-semibold tracking-tight text-white sm:text-[20px]">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="space-y-2.5 pl-0">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15.5px] leading-[1.7] text-neutral-200 sm:text-[16px]">
              <span
                className={`mt-[10px] h-1.5 w-1.5 shrink-0 rounded-sm ${a.fg.replace("text-", "bg-")}`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-2.5 pl-0">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-4 text-[15.5px] leading-[1.7] text-neutral-200 sm:text-[16px]">
              <span
                className={`mt-0.5 w-6 shrink-0 font-mono text-xs font-semibold ${a.fg}`}
                style={{ fontFamily: "var(--font-reader-mono), monospace" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <figure
          className={`my-8 rounded-xl border-l-[3px] bg-white/[0.03] px-6 py-5 ${a.soft}`}
        >
          <span
            className={`block font-serif text-4xl leading-none ${a.fg}`}
            aria-hidden
          >
            &ldquo;
          </span>
          <blockquote className="mt-1 text-[17px] italic leading-[1.65] text-neutral-100 sm:text-[18px]">
            {block.text}
          </blockquote>
        </figure>
      );
    case "code":
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#07080B] shadow-[0_4px_40px_-12px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <pre
            className="overflow-x-auto px-5 py-4 text-[12.5px] leading-[1.65] text-neutral-200"
            style={{
              fontFamily: "var(--font-reader-mono), ui-monospace, monospace",
            }}
          >
            <code>{block.text}</code>
          </pre>
        </div>
      );
  }
}
