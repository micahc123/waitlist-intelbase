// POST /api/billing/checkout
//
// Creates a Stripe Checkout Session (subscription mode, 14-day trial) for the
// signed-in user's org and returns its URL. The client redirects the browser
// there. On success Stripe sends them to /app?welcome=1; on cancel, /onboarding.
//
// FORK NOTE: standard App Router route-handler conventions confirmed against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
// (named method export, Web Request/Response). Force the nodejs runtime +
// dynamic since we read cookies and call Stripe.

import { stripe } from "@/lib/stripe";
import { getUserAndOrg } from "@/lib/auth";
import { ensureStripeCustomer, stripeConfigured } from "@/lib/billing";
import {
  getPriceId,
  isBillingInterval,
  isPlanId,
  TRIAL_DAYS,
} from "@/lib/stripe-plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function appUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request): Promise<Response> {
  if (!stripeConfigured()) {
    return Response.json(
      { error: "Billing is not configured yet" },
      { status: 503 },
    );
  }

  const { user, org } = await getUserAndOrg();
  if (!user || !org) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { plan?: unknown; interval?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const plan = body.plan;
  const interval = body.interval;
  if (!isPlanId(plan) || !isBillingInterval(interval)) {
    return Response.json(
      { error: "Invalid plan or interval" },
      { status: 400 },
    );
  }

  const priceId = getPriceId(plan, interval);
  if (!priceId) {
    return Response.json(
      { error: "Billing is not configured yet" },
      { status: 503 },
    );
  }

  try {
    const customerId = await ensureStripeCustomer(org, user.email);
    const base = appUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { org_id: org.id },
      },
      success_url: `${base}/app?welcome=1`,
      cancel_url: `${base}/onboarding`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return Response.json(
        { error: "Failed to create checkout session" },
        { status: 502 },
      );
    }
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: `Checkout failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
