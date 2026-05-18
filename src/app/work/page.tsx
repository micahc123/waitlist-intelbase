"use client";

import { useState } from "react";
import { TopNav } from "@/components/top-nav";
import { PastProjects } from "@/components/past-projects";
import { Footer } from "@/components/footer";
import { QuoteModal } from "@/components/quote-modal";

export default function WorkPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TopNav onQuote={() => setOpen(true)} active="work" />
      <main>
        <PastProjects />
      </main>
      <Footer onQuote={() => setOpen(true)} />
      <QuoteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
