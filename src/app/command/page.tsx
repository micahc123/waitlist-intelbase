// The cinematic command plane is now the gated SaaS product at /app. This old
// public route permanently redirects there so the plane is only reachable
// through the auth+subscription gate.
//
// VERIFY AGAINST FORK: import { redirect } from "next/navigation" confirmed
// against node_modules/next/dist/docs/01-app.

import { redirect } from "next/navigation";

export default function CommandPage() {
  redirect("/app");
}
