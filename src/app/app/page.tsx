// The gated, per-account SaaS product. The proxy auth+subscription-gates /app
// (and lets through when Supabase env is missing). This server component reads
// the signed-in user + org and renders the REAL work shell (sidebar + topbar +
// view router) with the Overview dashboard as the default surface.
//
// The cinematic command plane is no longer the whole product - it now lives as
// an on-demand "Command Center" showpiece at /app/command, reached from the
// shell's sidebar.
//
// RESILIENCE: must render even with NO Supabase env. getUserAndOrg() returns
// { user: null, org: null } in that case, so we fall back to a sensible default
// workspace name. Never throws.
//
// VERIFY AGAINST FORK: standard App Router page conventions (default-exported
// async server component + metadata). Confirmed metadata shape against
// node_modules/next/dist/docs.

import type { Metadata } from "next";
import { getUserAndOrg } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = {
  title: "Intelbase",
  robots: { index: false, follow: false }, // gated product surface, keep out of search
};

// Account data is read at request time, never prerendered.
export const dynamic = "force-dynamic";

export default async function AppPage() {
  const { user, org } = await getUserAndOrg();
  const orgName = org?.name || "Your business";
  const userEmail = user?.email ?? null;

  return <AppShell orgName={orgName} userEmail={userEmail} />;
}
