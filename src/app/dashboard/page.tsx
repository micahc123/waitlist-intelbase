// VERIFY AGAINST FORK: This uses STANDARD Next.js App Router page conventions
// (a default-exported component at app/dashboard/page.tsx). This repo runs a
// modified/breaking Next.js fork whose docs live in node_modules/next/dist/docs/
// and were NOT readable when this was written. After `npm install`, CHECK the
// page/metadata conventions against the fork docs. Keep this file thin, all UI is
// in src/components/dashboard-view.tsx (a client component that fetches /api/leads).
//
// DASH-01, DASH-02: the control dashboard page.

import { DashboardView } from "@/components/dashboard-view";

// Lead data is captured at request time, never prerendered.
// VERIFY AGAINST FORK: confirm `dynamic` is honored the same way in the fork.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardView />;
}
