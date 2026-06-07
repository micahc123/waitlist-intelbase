import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Whether Stripe is actually configured. Callers should guard on this and return
// a clear error rather than relying on a throw. We construct the client with a
// placeholder when unset so importing this module never throws (keeps the build
// and the public site working before billing is provisioned). Real API calls
// only happen behind `stripeConfigured` checks.
export const stripeConfigured = Boolean(secretKey);

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
