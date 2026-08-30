# VectorTrade Setup

VectorTrade is a full-stack React, TypeScript, Tailwind, Express, tRPC, and Drizzle project with first-party account registration, secure session cookies, provider-neutral verification states, and an operator console. It contains an original cyberpunk fintech landing page, a simulated chart-based trading terminal, and controlled deposit and adjustment workflows.

## Current operating mode

The interface is intentionally labeled as a **simulation environment**. The deposit address, market values, portfolio values, and activity rows are demo data. No private keys, real custody provider, live blockchain listener, real trading venue, or customer-fund movement is enabled in this version.

Before accepting customer funds, replace the demo deposit flow with a qualified custody or wallet infrastructure provider, add chain-indexer reconciliation, implement the full journal-posting transaction, complete KYC/AML and sanctions controls, and obtain jurisdiction-specific legal advice.

## Run locally

```bash
pnpm install
pnpm dev
```

The development server is started by the project template. The public landing page is available at `/`, the user terminal at `/terminal`, and the operations console at `/admin`.

## Validate the project

```bash
pnpm check
pnpm test
pnpm build
```

The tests cover authentication logout behavior and pure ledger invariants, including balanced journal entries and the rule that an operator cannot approve their own adjustment.

## Database

The schema is in `drizzle/schema.ts`. It includes deposit intents, ledger accounts, journal entries, journal lines, adjustment requests, holds, and audit events. The migration was generated into `drizzle/0001_rainy_doomsday.sql` and applied to the connected database through the managed database workflow.

The ledger design is append-only. A correction should create an adjustment request and later a journal entry; it should not mutate a user balance field or delete an earlier transaction. The current UI demonstrates this workflow but the final posting step remains deliberately disabled until accounting rules, custody, and compliance requirements are implemented.

## Admin access

Open `/admin` directly on the deployed domain, for example `https://vectortrade-two.vercel.app/admin`. Sign in through `/auth` using an account whose email matches the server-side `ADMIN_EMAIL` environment variable; that account is assigned the `admin` role during registration. Existing accounts can also be promoted through a controlled database operation. The admin console exposes receiving-address configuration under **Platform settings**. Users use the configured asset/network destination to create deposit intents; each request begins in `under_review` and appears in their activity history. No blockchain listener or automatic balance crediting is enabled.

Keep `ADMIN_EMAIL` and `JWT_SECRET` server-side only. In production, add email verification, MFA, rate limiting, password reset, session revocation, audit retention, and independent approval controls before handling customer funds.

## Brand asset

The VectorTrade logo is referenced in the application through the project-scoped storage URL:

```text
/vectortrade-mark.svg
```

The source logo file is also included in the delivered archive under `brand/vectortrade-logo.png`.

## Vercel considerations

The client-side landing page can be deployed to Vercel after building the Vite frontend. The current project also includes an Express server, tRPC procedures, first-party session authentication, and a managed database connection. Those backend pieces are not automatically equivalent to Vercel Functions. A production Vercel deployment would require either a Vercel-compatible API adapter for the tRPC/Express layer or a split deployment in which the frontend is served by Vercel and the authenticated backend remains on a compatible Node service.

Do not place database credentials, auth secrets, custody credentials, or wallet keys in `VITE_*` variables. Frontend-exposed values are not secrets. Use the project’s managed secret configuration for server-side credentials and configure the same variables in the eventual hosting provider only after reviewing the deployment architecture.

## Recommended next production steps

Connect a custody provider or HSM/MPC wallet service without exposing private keys to the application server. Add a chain indexer with idempotency and reorganization handling. Complete double-entry posting and reconciliation. Add KYC, sanctions, transaction monitoring, travel-rule handling where applicable, customer disclosures, privacy retention controls, incident response, and independent security review. Keep the demo banner until all of those controls are in place.
