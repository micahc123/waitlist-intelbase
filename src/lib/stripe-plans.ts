// Plan catalog + Stripe Price ID mapping for Intelbase billing.
//
// Three subscription tiers (starter / growth / scale), each with a monthly and
// an annual Stripe Price. The actual Price IDs come from env so this file is
// safe to import with NO Stripe env set (the ids are simply undefined, and the
// checkout/portal routes return a clear 503 when a required id is missing).
//
// Helpers:
//   getPriceId(plan, interval)  -> the Stripe Price ID, or undefined.
//   planFromPriceId(priceId)    -> reverse lookup used by the webhook to record
//                                  which plan a subscription is on.

export const TRIAL_DAYS = 14;

export type PlanId = "starter" | "growth" | "scale";
export type BillingInterval = "monthly" | "annual";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  priceIdMonthly: string | undefined;
  priceIdAnnual: string | undefined;
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 99,
    // ~2 months free on annual (10x monthly).
    priceAnnual: 990,
    priceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    priceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 299,
    priceAnnual: 2990,
    priceIdMonthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
    priceIdAnnual: process.env.STRIPE_PRICE_GROWTH_ANNUAL,
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 799,
    priceAnnual: 7990,
    priceIdMonthly: process.env.STRIPE_PRICE_SCALE_MONTHLY,
    priceIdAnnual: process.env.STRIPE_PRICE_SCALE_ANNUAL,
  },
};

export const PLAN_LIST: Plan[] = [PLANS.starter, PLANS.growth, PLANS.scale];

export function isPlanId(value: unknown): value is PlanId {
  return value === "starter" || value === "growth" || value === "scale";
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "annual";
}

// Returns the configured Stripe Price ID for a plan + interval, or undefined
// when the env var is not set (caller should treat that as "not configured").
export function getPriceId(
  plan: PlanId,
  interval: BillingInterval,
): string | undefined {
  const p = PLANS[plan];
  if (!p) return undefined;
  return interval === "annual" ? p.priceIdAnnual : p.priceIdMonthly;
}

// Reverse lookup: given a Stripe Price ID (from a subscription item), find the
// plan id. Used by the webhook to persist `plan`. Returns null if unknown.
export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const plan of PLAN_LIST) {
    if (plan.priceIdMonthly === priceId || plan.priceIdAnnual === priceId) {
      return plan.id;
    }
  }
  return null;
}
