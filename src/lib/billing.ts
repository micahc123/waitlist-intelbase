// Billing helpers: read an org's subscription, check access, and ensure a
// Stripe customer exists for an org.
//
// RESILIENCE: every function is safe to call with NO Stripe / Supabase env set.
//   - getOrgSubscription returns null
//   - hasActiveAccess returns false (never throws)
//   - ensureStripeCustomer throws only when called in a clearly misconfigured
//     state (callers in the route handlers guard with stripeConfigured() first
//     and return a 503 before reaching it).

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/auth";

export type Subscription = {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  status: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  updated_at: string;
};

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Returns the org's subscriptions row (user-scoped client, RLS applies), or
// null if none / unconfigured / on any error.
export async function getOrgSubscription(
  orgId: string,
): Promise<Subscription | null> {
  if (!supabaseConfigured() || !orgId) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as Subscription | null) ?? null;
  } catch {
    return null;
  }
}

// True only if the org has a subscription whose status is trialing/active AND
// whose trial/period has not expired. Resilient: returns false (not throw) on
// any error or when unconfigured.
export async function hasActiveAccess(orgId: string): Promise<boolean> {
  const sub = await getOrgSubscription(orgId);
  return subscriptionGrantsAccess(sub);
}

// Pure predicate so the same logic can be reused (e.g. in middleware) against a
// subscription row fetched by any client.
export function subscriptionGrantsAccess(
  sub: Pick<Subscription, "status" | "trial_end" | "current_period_end"> | null,
): boolean {
  if (!sub || !sub.status) return false;
  if (!ACTIVE_STATUSES.has(sub.status)) return false;

  const now = Date.now();

  if (sub.status === "trialing") {
    // During a trial, the trial_end (when present) is the gate.
    if (sub.trial_end) {
      return new Date(sub.trial_end).getTime() > now;
    }
    return true;
  }

  // active: honor current_period_end when present.
  if (sub.current_period_end) {
    return new Date(sub.current_period_end).getTime() > now;
  }
  return true;
}

// Returns a Stripe customer id for the org, creating one if absent and saving
// it onto the org's subscriptions row. Assumes the caller has already verified
// Stripe is configured (route handlers do this and return 503 otherwise).
export async function ensureStripeCustomer(
  org: Organization,
  userEmail: string | null | undefined,
): Promise<string> {
  const supabase = await createClient();

  const existing = await getOrgSubscription(org.id);
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: userEmail ?? undefined,
    name: org.name,
    metadata: { org_id: org.id },
  });

  if (existing) {
    await supabase
      .from("subscriptions")
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({
      org_id: org.id,
      stripe_customer_id: customer.id,
    });
  }

  return customer.id;
}
