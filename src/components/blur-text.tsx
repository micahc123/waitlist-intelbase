"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function BlurText({ text, className = "", delay = 200 }: BlurTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const words = text.split(" ");

  return (
    <h1 ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            isInView
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.7,
            delay: (i * delay) / 1000,
          }}
        >
          {word}
          {i < words.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </h1>
  );
}
