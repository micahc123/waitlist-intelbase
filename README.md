# Intelbase — Waitlist

A simple, single-page waitlist for **Intelbase**, the all-in-one AI operating system for business. Built with Next.js (App Router) + TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Hooking up emails

The signup form in [`app/waitlist-form.tsx`](app/waitlist-form.tsx) currently just shows a success state on submit. Replace the `// TODO` with a call to your provider (Resend, Mailchimp, ConvertKit) or a Next.js API route to actually store addresses.

## Deploy

Push to GitHub and import the repo into [Vercel](https://vercel.com) — zero config.
