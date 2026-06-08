# Intelbase — Waitlist

A simple, single-page waitlist for **Intelbase**, the all-in-one AI operating system for business. Built with Next.js (App Router) + TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Storing emails (Supabase — free)

Emails submitted on the form POST to the API route at
[`app/api/waitlist/route.ts`](app/api/waitlist/route.ts), which inserts them
into a Supabase table. The secret key lives only on the server.

**One-time setup:**

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard: **SQL Editor → New query**, paste
   [`supabase/schema.sql`](supabase/schema.sql), and **Run** it. This creates the
   `waitlist` table.
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **`service_role` secret** → `SUPABASE_SERVICE_ROLE_KEY`
4. Copy `.env.local.example` to `.env.local` and paste those two values in.
5. `npm run dev` and submit the form — the row appears under
   **Table Editor → waitlist**.

**On Vercel:** add the same two env vars under
**Project → Settings → Environment Variables**, then redeploy.

> The `service_role` key bypasses row-level security, so keep it secret — it's
> only ever used in the server-side API route, never sent to the browser.

## Deploy

Push to GitHub and import the repo into [Vercel](https://vercel.com) — then add
the two env vars above.
