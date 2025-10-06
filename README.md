# TimeCapsule

A modern, full‑stack Next.js application for creating, storing, and unlocking “time capsules.” The goal is to let users save content that becomes accessible at a future date—securely, reliably, and with a great developer experience.

This repository currently ships a Next.js 15 (App Router) app with shadcn/ui and Tailwind CSS v4 set up. The broader TimeCapsule vision includes type‑safe APIs with tRPC, Prisma + PostgreSQL, Clerk authentication, and integrations like Cloudinary (media), Razorpay (payments), and Google Maps.

## Features

- Next.js 15 App Router with React 19
- Tailwind CSS v4 and shadcn/ui component library
- Accessible, responsive UI primitives
- Production-ready Next config (images unoptimized for portability)
- Planned: tRPC, Prisma/PostgreSQL, Clerk auth, Cloudinary uploads, Razorpay payments, Google Maps

## Tech Stack

- Framework: Next.js 15 (App Router), React 19
- UI: Tailwind CSS v4, shadcn/ui, Radix primitives
- Forms & Validation: react-hook-form, zod
- Charts: Recharts (via shadcn/ui)
- Planned Backend: tRPC, Prisma ORM + PostgreSQL
- Planned Auth: Clerk
- Planned Integrations: Cloudinary, Razorpay, Google Maps API

## Getting Started

Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm, npm, or yarn

Install and run
\`\`\`bash
# install dependencies
pnpm install
# or: npm install

# start dev server
pnpm dev
# or: npm run dev

# build and start
pnpm build && pnpm start
\`\`\`

Available scripts (from package.json)
- dev — start Next.js in development
- build — compile for production
- start — run the production build
- lint — run Next.js lint

## Environment Variables

The current UI runs without credentials, but the full TimeCapsule feature set will require these variables:

Authentication (Clerk)
- CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL (optional)
- NEXT_PUBLIC_CLERK_SIGN_UP_URL (optional)

Database (PostgreSQL via Prisma)
- DATABASE_URL

Uploads (Cloudinary)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Payments (Razorpay)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET (if using webhooks)

Maps
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

Realtime (optional)
- e.g., PUSHER_*/ABLY_* if you add a third‑party realtime provider

On Vercel, set these in Project Settings → Environment Variables. In local development, use your preferred .env file management.

## Folder Structure

This repository includes the following key directories by default:
- app/ — App Router pages and layouts
- components/ — shadcn/ui and app components
  - components/ui — generated shadcn/ui primitives
- hooks/ — reusable hooks
- lib/ — utilities (e.g., cn function)
- public/ — static assets
- styles/ — global styles
- config — next.config.mjs, postcss.config.mjs, tailwind config inlined via Tailwind v4

When backend pieces are added, you’ll typically see:
- prisma/ — Prisma schema and migrations
- server/ — tRPC routers and server-side logic
- utils/ and types/ — shared helpers and TypeScript types

## Development Notes

- Styling: Prefer semantic tokens (via Tailwind v4 + globals) and shadcn/ui variants.
- Accessibility: Use semantic HTML, ARIA attributes, and ensure color contrast.
- Data fetching: Favor server components or SWR for client caching; avoid useEffect fetches.
- Charts: Use Recharts components provided via shadcn/ui patterns.

## Roadmap

- Add tRPC routers for capsules (CRUD, scheduled unlocks)
- Integrate Prisma + PostgreSQL schema for capsules and metadata
- Secure auth with Clerk (RLS and access control at the API layer)
- Cloudinary for media within capsules
- Optional payments via Razorpay
- Optional geofenced unlocks via Google Maps API
- Realtime updates for capsule states (e.g., countdowns, unlock events)

## Deployment

- Deploy on Vercel (recommended). Set all required environment variables before publishing.
- Ensure DATABASE_URL points to a managed Postgres (e.g., Neon, Supabase).
- If using Prisma, run migrations as part of your deployment workflow.

## Contributing

1. Fork the repo and create a feature branch.
2. Make changes with clear, atomic commits.
3. Open a PR with a concise description and screenshots if UI is affected.

## License

MIT — see LICENSE if/when added.
