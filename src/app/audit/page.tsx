// VERIFY AGAINST FORK: STANDARD Next.js App Router page conventions (a
// default-exported component at app/audit/page.tsx, plus an exported `metadata`
// object). The fork's docs (01-app/.../03-layouts-and-pages.md and
// 14-metadata-and-og-images.md) confirm these conventions hold here. Keep this
// page thin; the scorecard UI lives in src/components/readiness-audit.tsx.
//
// GROW-08: standalone, linkable page for the AI Readiness Audit. The same audit
// section is also mountable inline on the homepage, but this gives it a shareable
// URL (/audit) for ads and outbound.

import type { Metadata } from "next";
import { AuditPageView } from "@/components/audit-page-view";

export const metadata: Metadata = {
  title: "AI Readiness Audit | intelbase OS",
  description:
    "How AI-ready is your front office? Take the 2 minute scorecard and get an instant readiness score plus a tailored map of which intelbase OS modules to start with.",
  openGraph: {
    title: "AI Readiness Audit | intelbase OS",
    description:
      "Score how your business handles leads today and see which intelbase OS modules would move the needle first.",
  },
};

export default function AuditPage() {
  return <AuditPageView />;
}
