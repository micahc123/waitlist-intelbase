// The cinematic "Command Center" - the showpiece 3D command plane, now an
// on-demand view reached from the work shell (not the default product surface).
//
// The day-to-day product lives at /app (a real SaaS work shell). This route
// mounts the full-screen cinematic CommandApp and overlays a small "Back to
// dashboard" link so the operator can always return to work.
//
// RESILIENCE: getUserAndOrg() returns nulls with no Supabase env; we fall back
// to a sensible workspace name and never throw.
//
// VERIFY AGAINST FORK: standard App Router server-component page + metadata,
// confirmed against node_modules/next/dist/docs.

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserAndOrg } from "@/lib/auth";
import { CommandApp } from "@/components/command/command-app";

export const metadata: Metadata = {
  title: "Command Center | Intelbase",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommandPage() {
  const { user, org } = await getUserAndOrg();
  const orgName = org?.name || "Your business";
  const userEmail = user?.email ?? null;

  return (
    <>
      <CommandApp orgName={orgName} userEmail={userEmail} />
      <Link
        href="/app"
        aria-label="Back to dashboard"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 34,
          padding: "0 14px 0 11px",
          borderRadius: "var(--ib-r-pill)",
          border: "1px solid var(--ib-border-strong)",
          background: "var(--ib-overlay)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "var(--ib-text)",
          font: "600 var(--ib-fs-sm)/1 var(--ib-font)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to dashboard
      </Link>
    </>
  );
}
