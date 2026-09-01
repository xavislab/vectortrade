# VectorTrade Setup

VectorTrade is a full-stack React, TypeScript, Tailwind, Express, tRPC, and Drizzle project with first-party account registration, secure session cookies, provider-neutral verification states, and an operator console. It contains an original cyberpunk fintech landing page, chart-based strategy workspaces, and controlled deposit and adjustment workflows.

## Current operating mode

The platform provides chart-based strategy workspaces, manually reviewed deposit requests, and role-controlled operations. Balance crediting and external settlement remain subject to verified infrastructure, reconciliation, approval, and compliance controls.

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

The ledger design is append-only. A correction should create an adjustment request and later a journal entry; it should not mutate a user balance field or delete an earlier transaction. The interface exposes this workflow while final posting remains subject to accounting rules, verified infrastructure, and compliance controls.

## Admin access

The admin interface is temporarily open for visual inspection at `https://vectortrade-two.vercel.app/admin`. The former `/admin/login` path now displays the same interface. This inspection mode removes the frontend login screen, but backend admin procedures remain role-protected and may return authorization errors until a valid administrator session is restored.

Before any real deployment or customer use, restore the `AdminGate` role check in `client/src/App.tsx` and restore the administrator access-code route. Never expose the operations console or privileged procedures publicly in a production environment.

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

Connect a custody provider or HSM/MPC wallet service without exposing private keys to the application server. Add a chain indexer with idempotency and reorganization handling. Complete double-entry posting and reconciliation. Add KYC, sanctions, transaction monitoring, travel-rule handling where applicable, customer disclosures, privacy retention controls, incident response, and independent security review. Complete these controls before enabling any live settlement workflow.

## Supabase and Brevo authentication

The browser authentication client is configured through `client/src/lib/supabase.ts` and uses `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`. The supplied Supabase project URL and publishable key are included as safe local defaults; Vercel environment variables should be used for production overrides.

In Supabase, enable email authentication and OTP signup verification under **Authentication → Providers → Email**. Set the production site URL and redirect URL to the deployed Vercel origin. To deliver verification messages through Brevo, configure Supabase’s custom SMTP settings with Brevo’s SMTP relay and a verified sender identity. The Brevo API key belongs only in the server/provider configuration; it must not be placed in frontend code or any `VITE_*` variable. The OTP modal is rendered by the VectorTrade `/auth` flow after Supabase returns a signup requiring confirmation.

Required Vercel frontend variables:

```text
VITE_SUPABASE_URL=https://fdzstpbpgriorwtcrigm.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-publishable-key>
VITE_API_BASE_URL=<deployed-express-api-origin>
```

Required backend variables:

```text
DATABASE_URL=<managed-mysql-url>
JWT_SECRET=<long-random-secret>
ADMIN_EMAIL=<initial-admin-email>
ADMIN_ACCESS_CODE=<long-random-private-code>
BREVO_API_KEY=<server-only-brevo-key-if-direct-email-api-is-used>
BREVO_SENDER_EMAIL=<verified-brevo-sender>
BREVO_SENDER_NAME=VectorTrade
```

Supabase Auth manages the email-confirmation identity, while the application backend synchronizes the verified user into the VectorTrade profile and session model. Apply the latest SQL migration before testing registration, subscription requests, deposit intents, verification submissions, or admin receiving-address configuration.

## Supabase verification code email

To send a verification code instead of a clickable confirmation link, open Supabase **Authentication → Email Templates → Confirm signup** and make the message include `{{ .Token }}` as the verification code. Do not use only `{{ .ConfirmationURL }}`. Keep the VectorTrade `/auth` OTP modal enabled; it verifies the code with `verifyOtp({ email, token, type: "signup" })`. The same configuration can be applied to the email-change template if email changes are enabled later.

If the template still contains only the confirmation URL, Supabase will continue sending a link. This is controlled by the Supabase email template and cannot be changed by frontend JavaScript.
