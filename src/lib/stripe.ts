import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});
