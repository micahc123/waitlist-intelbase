// /onboarding -- where users land right after signing up.
//
// Server component: reads the caller's org. If they have already finished
// onboarding, send them straight to /app. Otherwise render the client wizard,
// prefilled with their current org name (empty in the unconfigured/dev state).
//
// The proxy lets /onboarding through when Supabase env is missing, so this page
// must render fine with no user/org -- getUserAndOrg() returns nulls then.

import { redirect } from "next/navigation";
import { getUserAndOrg } from "@/lib/auth";
import { Onboarding } from "@/components/onboarding/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user, org } = await getUserAndOrg();

  if (org?.onboarded) {
    redirect("/app");
  }

  return (
    <Onboarding
      initialName={org?.name ?? ""}
      userEmail={user?.email ?? null}
    />
  );
}
