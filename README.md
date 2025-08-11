# Supabase x Reown: Web3 Wallet Auth Starter

[![CI](https://github.com/velcrafting/supabase-web3-wallet-auth-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/velcrafting/supabase-web3-wallet-auth-starter/actions/workflows/ci.yml)
[![CodeQL](https://github.com/velcrafting/supabase-web3-wallet-auth-starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/velcrafting/supabase-web3-wallet-auth-starter/actions/workflows/codeql.yml)
![Node 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![pnpm](https://img.shields.io/badge/pnpm-enabled-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Modern Next.js hybrid authentication that plugs Reown (WalletConnect) wallets into Supabase Auth. Users are stored in `auth.users` with extended profiles in `public.profiles`, giving you a clean base to build more on-chain features alongside an off-chain database.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [RLS Configuration](#rls-configuration)
- [Customization](#customization)
- [Core Features Walkthrough](#core-features-walkthrough)
- [Usage Ideas](#usage-ideas)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [Connect](#connect)

---

## Features
- Reown (WalletConnect) wallet authentication backed by Supabase Auth with JWT cookies
- Global middleware for protected routes
- Server actions API with:
  - Public/protected middlewares and Zod schema validation
  - Supabase anon and service role APIs
  - Row Level Security (RLS) enforced by default for database queries
- Login, Register, Logout, and Delete flows
- Coupled `auth.users` and `public.profiles` tables (trigger-based profile creation)
- Reown Onramp, Swap, and History features
- Easy app configuration in `lib/config/site.ts`
- **Experimental:** multiple wallet linking per profile
- **Experimental:** custodial NFT mint/burn page
- Activity logging API
- Service worker for basic PWA support

---

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: PostgreSQL ([Supabase](https://supabase.com/))
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

---

## Prerequisites
- Node.js >= 20
- [pnpm](https://pnpm.io/)

---

## Quick Start

```bash
git clone https://github.com/velcrafting/supabase-web3-wallet-auth-starter.git
cd supabase-web3-wallet-auth-starter
pnpm install
cp .env.example .env
```

### 1. Supabase Configuration
1. Create a project at [Supabase](https://supabase.com/) and copy the Project URL, anon key, and service role key.
2. Add them to `.env` as:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Generate a secret for signing JWTs and set `AUTH_SECRET`:
   ```bash
   openssl rand -hex 32
   ```
4. Configure the RLS client user (see [RLS Configuration](#rls-configuration)).
5. Apply migrations:
   ```bash
   pnpm db:migrate
   ```

### 2. Reown Project
1. Sign in at the [Reown dashboard](https://dashboard.reown.com) and create a project.
2. Add the WalletConnect Project ID to `.env` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### 3. Run the App
```bash
pnpm dev
```
Open the app, sign in with a wallet, and test **Dashboard → Wallets** to link or remove wallets.

---

## Environment Variables

| Variable | Description | Required | Default |
| --- | --- | --- | --- |
| `DIRECT_URL` | Direct Postgres connection string for Drizzle migrations | yes | – |
| `ADMIN_DATABASE_URL` | Full-privilege Postgres connection | yes | – |
| `DATABASE_URL` | RLS-enabled Postgres connection (`rls_client`) | yes | – |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | yes | – |
| `AUTH_SECRET` | JWT signing and verification secret | yes | – |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | yes | – |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | yes | – |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID from Reown | yes | – |
| `NEXT_PUBLIC_SITE_URL` | Base site URL for metadata and PWA | no | `http://localhost:3000` |
| `WALLET_PRIVATE_KEY` | Custodial NFT private key | no | – |
| `NFT_CONTRACT_ADDRESS` | NFT contract address for mint/burn | no | – |

---

## RLS Configuration

Create a dedicated RLS client before migrations:

```sql
CREATE USER rls_client
WITH
  LOGIN PASSWORD '[DB_PASSWORD]';

GRANT anon TO rls_client;
GRANT authenticated TO rls_client;
```

Then set your connections:

```env
ADMIN_DATABASE_URL=postgresql://postgres:[DB_PASSWORD]@...
DATABASE_URL=postgresql://rls_client:[DB_PASSWORD]@...
```

---

## Customization
Update `lib/config/site.ts` with branding and project details. Ensure `.env` mirrors your deployment environment.

---

## Core Features Walkthrough

### Multi-wallet Flow
1. Sign in with a wallet
2. Go to **Dashboard → Wallets**
3. Click **Link wallet** and sign
4. Use **Remove wallet** to unlink

### Activity Logs
Use `lib/actions/activity.ts` to record and query actions. View entries on the Activity page.

### NFT Mint/Burn (Experimental)
Enable by setting `WALLET_PRIVATE_KEY` and `NFT_CONTRACT_ADDRESS` in `.env`.

### Service Worker
`public/serviceworker.js` and `components/service-worker.tsx` add basic offline caching.

---

## Usage Ideas
- Token-gated memberships
- Cross-chain aggregated profiles
- Extended profiles with badges, social links, on-chain stats

---

## Known Issues
- Activity page is experimental and may not display all events

---

## Contributing
PRs are welcome. Open an issue for discussion or submit a PR directly.

---

## Acknowledgements
Inspired by [Locastic/next-web3-hybrid-starter](https://github.com/Locastic/next-web3-hybrid-starter), modernized with current stack and Reown integration.

---

## Connect
Follow [@velcrafting on X](https://x.com/velcrafting).
