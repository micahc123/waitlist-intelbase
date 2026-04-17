"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const testimonials = [
  {
    quote:
      "A complete rebuild in five days. The result outperformed everything we\u2019d spent months building before.",
    name: "Sarah Chen",
    role: "CEO, Luminary",
  },
  {
    quote:
      "Conversions up 4x. That\u2019s not a typo. The design just works differently when it\u2019s built on real data.",
    name: "Marcus Webb",
    role: "Head of Growth, Arcline",
  },
  {
    quote:
      "They didn\u2019t just design our site. They defined our brand. World-class doesn\u2019t begin to cover it.",
    name: "Elena Voss",
    role: "Brand Director, Helix",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            What They Say
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            Don&apos;t take our word for it.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="liquid-glass rounded-2xl p-8"
            >
              <p className="text-white/80 font-body font-light text-sm italic leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white font-body font-medium text-sm">
                  {t.name}
                </p>
                <p className="text-white/50 font-body font-light text-xs">
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
