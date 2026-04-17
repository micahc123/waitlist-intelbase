import { TopNav } from "@/components/top-nav";
import { CoursesGrid } from "@/components/courses-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses — Intelbase",
  description:
    "Field-tested ebooks on AI automation, Claude Code, social media pipelines with OpenClaw and Higgsfield, and running ad campaigns with the claude-ads skill.",
};

export default function CoursesPage() {
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
      <main className="relative z-10 h-[100dvh] overflow-hidden">
        <CoursesGrid />
      </main>
    </>
  );
}
