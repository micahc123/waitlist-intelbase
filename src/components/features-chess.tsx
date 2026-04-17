"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const features = [
  {
    title: "Designed to convert. Built to perform.",
    body: "Every pixel is intentional. Our AI studies what works across thousands of top sites\u2014then builds yours to outperform them all.",
    cta: "Learn more",
    image: "/images/feature-1.gif",
    reverse: false,
  },
  {
    title: "It gets smarter. Automatically.",
    body: "Your site evolves on its own. AI monitors every click, scroll, and conversion\u2014then optimizes in real time. No manual updates. Ever.",
    cta: "See how it works",
    image: "/images/feature-2.gif",
    reverse: true,
  },
];

export function FeaturesChess() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="relative px-6 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            Pro features. Zero complexity.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-24">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className={`flex flex-col ${feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-heading italic text-white leading-[0.95] mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed mb-6">
                  {feature.body}
                </p>
                <a
                  href="#contact"
                  className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white font-body inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  {feature.cta}
                </a>
              </div>

              {/* Image */}
              <div className="flex-1 liquid-glass rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
