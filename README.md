# EcoFurnish

A full-stack e-commerce site for sustainable furniture made from recycled
materials — built with Next.js, Drizzle, and Better Auth, with real
payment processing, email, and admin tooling rather than mocked-out
placeholders.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- **Database:** Neon (serverless Postgres) + Drizzle ORM
- **Auth:** Better Auth — email/password, email verification, sessions,
  account deletion, all with real email notifications
- **Payments:** [Chapa](https://chapa.co) — Ethiopia's payment gateway,
  supports both local methods (Telebirr, CBE Birr) and major
  international cards/PayPal
- **Email:** Resend, sending from a verified domain
- **Captcha:** Cloudflare Turnstile
- **UI:** shadcn/ui on Base UI primitives, Tailwind CSS v4
- **Styling:** custom eco-themed color palette (moss green + clay accent),
  full dark/light/system theme support

## Features

- Product catalog with search, category filtering, and live currency
  switching (ETB/USD/GBP)
- Cart and wishlist (persisted, scoped per signed-in account)
- Full checkout → real payment via Chapa → order confirmation, with
  stock only decremented after payment actually succeeds
- Accounts: sign up with email verification, sign in with "remember me,"
  profile with a color+icon avatar (no file upload needed), currency
  preference, password change, account deletion (email-confirmed)
- Admin dashboard: product CRUD, order management with status tracking,
  basic stats
- Transactional email for every major event (welcome, order confirmation,
  password changed, contact form, newsletter, account deletion)
- Fully responsive, with a working mobile nav
- Light/dark/system theme, with a distinct look for explicitly-chosen
  Light vs. System-resolved-light

## Getting started

See **[SETUP.md](./SETUP.md)** for the full setup walkthrough — installing
dependencies, environment variables, database setup, and seeding starter
products. Two more focused guides:

- **[SETUP-CAPTCHA.md](./SETUP-CAPTCHA.md)** — getting a free Turnstile key
- **[SETUP-IMAGES.md](./SETUP-IMAGES.md)** — swapping in properly-licensed
  product photos

Once set up:

```
pnpm dev
```

## Testing everything

**[TESTING.md](./TESTING.md)** is a full walkthrough for verifying every
feature actually works — email delivery, the full auth flow, payments,
currency switching, dark mode, and mobile.

## Deploying

**[DEPLOY.md](./DEPLOY.md)** covers pushing to Vercel and connecting a
real domain.

## Project structure

```
app/                  Routes (App Router) — pages, API routes, server actions
  actions/            Server actions (orders, contact, newsletter, captcha)
  admin/               Admin dashboard (product/order management)
  account/             Profile, orders, currency, password, delete account
  api/                 Route handlers (auth catch-all, Chapa callback)
components/
  layout/              Navbar, footer, and their sub-components
  home/                Homepage sections (hero, categories, testimonials, etc.)
  product/             Product card, detail page pieces, cart actions
  admin/               Admin-only forms and controls
  account/             Account settings forms (avatar, currency, password)
  ui/                  shadcn/ui primitives
db/
  schema.ts            Drizzle schema — products, orders, newsletter subs
  seed.ts               Seeds starter products
lib/                   Shared logic — cart/wishlist state, currency,
                        email, Chapa client, password strength, avatars
config/                 Site-wide config (nav, site info, theme)
data/                   Static content (categories, testimonials, footer links)
```

## A few honest notes

- Payments run in Chapa's test mode — no real money moves until you swap
  in live keys.
- The product photos need replacing before this goes anywhere public —
  see `SETUP-IMAGES.md`.
- `docs/` has a running dev journal and migration notes from building
  this out, if you're curious about the process.
