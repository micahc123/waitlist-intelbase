"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

const paths = {
  a: {
    label: "We Do Everything",
    badge: "Usually done same day",
    steps: [
      {
        title: "Message us on WhatsApp",
        desc: "Tell us what you need — OpenClaw, n8n, full infra. We figure out the rest.",
      },
      {
        title: "We connect to your system",
        desc: "We remote into your Mac Mini, VPS, or server securely. You don't touch anything.",
      },
      {
        title: "We set up everything",
        desc: "OpenClaw, n8n workflows, agents, integrations — installed, configured, and tested.",
      },
      {
        title: "You're live",
        desc: "Everything running. We walk you through it before we're done.",
      },
    ],
  },
  b: {
    label: "Guided Setup",
    badge: "Done in 45 min or less",
    steps: [
      {
        title: "Message us on WhatsApp",
        desc: "Tell us what you want to set up and we'll schedule a live session.",
      },
      {
        title: "We guide you on a call",
        desc: "Screen share over Google Meet — we walk you through every step on your own machine.",
      },
      {
        title: "You're up & running",
        desc: "By end of the session, everything works. You understand it all before we hang up.",
      },
    ],
  },
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<"a" | "b">("a");
  const current = paths[active];

  return (
    <section id="how-it-works" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Simple Process
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
        </motion.div>

        {/* Path toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex justify-center"
        >
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#111214] p-1">
            <button
              onClick={() => setActive("a")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                active === "a"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              We Do Everything
            </button>
            <button
              onClick={() => setActive("b")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                active === "b"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Guided Setup
            </button>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 flex justify-center"
        >
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-300/90">
            {current.badge}
          </span>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-white/[0.12] via-white/[0.06] to-transparent" />

          <div className="flex flex-col gap-8">
            {current.steps.map((step, i) => (
              <motion.div
                key={`${active}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex gap-5"
              >
                <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-[#111214] text-xs font-semibold text-white">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pt-0.5">
                  <p className="text-[15px] font-medium text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="https://wa.me/85290123551"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Get Started on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
