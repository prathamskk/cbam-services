# CBAM Evidence & Liability (MVP)

Next.js App Router UI with Supabase (Postgres, Auth, Storage) and shadcn/ui. Deploy the app on Vercel (Hobby) and create a Supabase free-tier project.

## Features

- **Evidence vault**: drag-and-drop uploads with `pending` / `verified` / `rejected` states (private Storage bucket).
- **Threshold tracker**: cumulative mass per CN code vs a **50 t** annual band (demo model).
- **Default vs actual liability**: compare EU default factors to supplier actuals with an ETS price slider and bar chart.
- **Supplier portal**: opaque token links (`/portal/[token]`) scoped with the service role after token validation.
- **Mock EU XML export**: `GET /api/export/eu-registry` returns an illustrative XML attachment (replace with the official registry schema later).

## Local setup

1. Copy [`.env.local.example`](.env.local.example) to `.env.local` and fill in Supabase URL, anon key, and **service role** key (required for portal uploads). The app includes placeholder fallbacks so `next build` can run without a local `.env`; replace them with real project keys before using the app.

2. In the Supabase SQL editor (or CLI), run the migration in [`supabase/migrations/20260420120000_init.sql`](supabase/migrations/20260420120000_init.sql). This creates tables, RLS for authenticated importers, the `documents` storage bucket, and seed data.

3. Install and run:

```bash
npm install
npm run dev
```

4. Open `/login`, create an importer account, then use **Shipment register**, **Evidence vault**, **Liability modeler**, and **Suppliers** (portal links).

## Deploy (Vercel + Supabase, free tier)

- Connect the Git repo to Vercel; set the same environment variables as `.env.local`.
- Set `NEXT_PUBLIC_APP_URL` to your production URL so supplier portal links are correct.
- Ensure Supabase Auth redirect URLs include your Vercel domain if you enable email confirmation.

## Positioning

This MVP is a **compliance infrastructure layer**: threshold exposure, evidence chain, and registry-oriented export — not “just a calculator.”
