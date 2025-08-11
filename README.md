# Supabase x Reown: Web3 Wallet Auth Starter

Modern Next.js hybrid authentication that plugs Reown (WalletConnect) wallets into Supabase Auth. Users are stored in `auth.users` with extended profiles in `public.profiles`, giving you a clean base to build more on-chain features, with off-chain database.

## Features

- Reown (WalletConnect) wallet authentication backed by Supabase Auth with JWTs cookies
- Global middleware for protected routes
- Server actions API with the following features:
  - public/protected middlewares and Zod schema validation
  - Available Supabase anon & service role apis
  - Row Level Security (RLS) enforced by default for database queries (needs specific configuration)
- Login/Register/Logout/Delete flows
- Both `auth.users` with `public.profiles` tables are coupled: new users are created using supabase, a postgres trigger will insert the respective row to `public.profiles`
- Usage of Reown's Onramp, Swap, and History functionalities
- Easy app configuration for white-glove branding in `lib/config/site.ts`.
- **Experimental:** link multiple wallets to a single profile

## Teck Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: PostgreSQL ([Supabase](https://supabase.com/))
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Quick Start

```bash
git clone https://github.com/velcrafting/supabase-web3-wallet-auth-starter.git
cd supabase-web3-wallet-auth-starter
pnpm install
cp .env.example .env
```

### 1. Supabase configuration

  1. Create a project at [Supabase](https://supabase.com/) and copy the Project URL, anon key and service role key.
  2. Paste them into your `.env` as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
  3. Create an `rls_client` Postgres user (granted `anon` and `authenticated` roles) and set `DATABASE_URL` & `ADMIN_DATABASE_URL` in `.env`.
    ```sql
    CREATE USER rls_client
    WITH
      LOGIN PASSWORD '[DB_PASSWORD]';

    GRANT anon TO rls_client;
    GRANT authenticated TO rls_client;
    ```
    Use `rls_client` for `DATABASE_URL` and keep `postgres` as the superuser for `ADMIN_DATABASE_URL`.
  4. Apply database migrations to set up `auth.users` alongside the extensible `public.profiles` table.

  ```bash
  pnpm db:migrate
  ```

### 2. Reown project

  1. Sign in to the [Reown dashboard](https://dashboard.reown.com) and create a project.
  2. Copy the WalletConnect Project ID into `.env` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### 3. Run the app

  ```bash
  pnpm dev
  ```

  Sign in with any wallet and explore the dashboard. In **Dashboard → Wallets** you can link or remove additional wallets from your profile.

## Customization

Project-specific metadata is centralized in `lib/config/site.ts`. Update this file along with your `.env` to tailor the template for your project.

## Running Locally

copy `.env.example` to `.env` and fill the values, then update `lib/config/site.ts` with your project details.

Then run the database migrations:

```bash
pnpm db:migrate
```

Finally, run the app:

```bash
pnpm dev
```

## Multi-wallet flow

1. Sign in with any wallet to create a session.
2. Navigate to **Dashboard → Wallets**.
3. Click **Link wallet** and complete the signature to attach another wallet to the current profile.
4. Use **Remove wallet** next to any entry to unlink it. The list should update after each action.

These steps exercise the API routes for linking and removing wallets so contributors can verify the feature locally.

## RLS configuration

In order to be able to use the RLS wrapper, you need to first create a new `rls_client` postgres user and use that in your `DATABASE_URL` env variable instead of the default `postgres` which bypasses RLS:

```sql
CREATE USER rls_client
WITH
  LOGIN PASSWORD '[DB_PASSWORD]';

GRANT anon TO rls_client;

GRANT authenticated TO rls_client;
```
Now, you'll have 2 different connection strings:
```.env
...
ADMIN_DATABASE_URL=postgresql://postgres(.pooler_tenant_id):[DB_PASSWORD]@...
DATABASE_URL=postgresql://rls_client(.pooler_tenant_id):[DB_PASSWORD]@...
...
```

## Usage ideas

- Token-gated communities or memberships.
- Cross-chain profiles that aggregate multiple addresses.
- Extend `public.profiles` with badges, social links or on-chain stats.

## Known issues

- Activity page is experimental and may not display events correctly.

## Contributing

Have an idea or fix? Open an issue or make a pull request—community contributions are welcome.

## Acknowledgements

Originally inspired by [Locastic/next-web3-hybrid-starter](https://github.com/Locastic/next-web3-hybrid-starter); this repo modernizes the stack and updates WalletKit with current Reown calls.

## Connect

Follow [@velcrafting on X](https://x.com/velcrafting) or reach out if you'd like to collaborate or discuss opportunities.