# EcoFurnish — Setup Guide

Everything below assumes you've merged these files into your local project
(copy everything from this zip into your project folder, overwriting
existing files — but keep your own `.env`, it wasn't included here).

## 0. Fix your `.env` first, and add the new keys

Open `.env` and check `DATABASE_URL`. If it looks like this:

```
DATABASE_URL="<postgresql://user:pass@host/db?sslmode=require>"
```

...remove the `<` and `>` — they're a leftover from Neon's dashboard
placeholder, and they make the connection string invalid:

```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

Then add these new variables:

```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CHAPA_SECRET_KEY="CHASECK_TEST-..."
CHAPA_WEBHOOK_SECRET="..."
RESEND_API_KEY="re_..."
CONTACT_FORM_TO_EMAIL="you@example.com"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
GEMINI_API_KEY="..."
```

- **Chapa** (payments) — sign up at [dashboard.chapa.co](https://dashboard.chapa.co),
  go to Settings → API to grab your test secret key. No business
  verification needed for test mode. Ethiopia isn't a supported country
  for Stripe accounts, which is why this uses Chapa instead — it's built
  for exactly this.
- **`CHAPA_WEBHOOK_SECRET`** — a separate value from `CHAPA_SECRET_KEY`.
  In the Chapa dashboard under Settings → Webhooks, set your webhook URL
  to `{NEXT_PUBLIC_APP_URL}/api/chapa/callback` and set a secret hash
  there — paste that same value here. `app/api/chapa/callback/route.ts`
  uses it to verify the `x-chapa-signature` header on every incoming
  webhook call, so a request that doesn't carry a valid signature for
  this secret is rejected before it can touch an order.
- **Resend** (email) — sign up at [resend.com](https://resend.com), create
  an API key. The free tier (3,000 emails/month) is plenty for this, and
  you don't need to verify your own domain to start — `lib/email.ts`
  sends from Resend's shared test address by default.
- **`CONTACT_FORM_TO_EMAIL`** — where messages from `/contact` get sent.
  Resend's shared address can only deliver to the email your Resend
  account is registered with, so use that same address here.
- **`NEXT_PUBLIC_APP_URL`** — Chapa needs a real, absolute URL to redirect
  back to. Once you deploy, change this to your real domain.
- **Turnstile** (captcha on sign-up) — free, sign up at the
  [Cloudflare dashboard](https://dash.cloudflare.com) → Turnstile → Add
  Widget, add `localhost` as a domain for local dev. For quick local
  testing without a real account, Cloudflare's public test keys work:
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` and
  `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` (always
  passes — don't ship these, just useful while developing).
- **`TELEGRAM_BOT_TOKEN`** / **`TELEGRAM_CHAT_ID`** — power the daily
  digest bot (`app/api/cron/daily-digest`). Free — message @BotFather on
  Telegram, run `/newbot`, and it gives you the token. Then message your
  new bot anything at all (bots can't message you first), and visit
  `https://api.telegram.org/bot<token>/getUpdates` in a browser — the
  numeric `id` under `"chat"` in that response is your `TELEGRAM_CHAT_ID`.
- **`GEMINI_API_KEY`** — optional. Without it, the digest still sends,
  just as the plain-text version from `lib/insights.ts` instead of a
  rephrased one. Free tier, no card required, at
  [aistudio.google.com](https://aistudio.google.com) — Google has cut
  free-tier limits before, so check current limits there if the digest
  stops narrating.

## 1. Install dependencies

```
pnpm install
```

This pulls in `tsx`, which is new — needed to run the seed script.

## 2. Create the database tables

Two separate migration systems, since Drizzle and Better Auth manage their
own tables independently:

```
pnpm db:push        # creates products / orders / order_items from db/schema.ts
pnpm auth:migrate    # creates/updates user / session / account / verification / rateLimit tables
```

Run `pnpm auth:migrate` again any time you add a new field to `user.additionalFields`
in `lib/auth.ts` (e.g. the `preferredCurrency` field added for account
settings) — it's an additive migration, safe to re-run. This also creates
the `rateLimit` table used to persist auth rate-limit counters to the
database instead of memory (see `lib/auth.ts`) — run it before deploying,
or the `storage: "database"` rate-limit config will error against a
table that doesn't exist yet.

## 3. Seed starter products

```
pnpm db:seed
```

Adds the 7 products you already have images for, with placeholder prices —
edit `db/seed.ts` and re-run any time to change names/prices/descriptions.
(Re-running will add duplicates rather than update existing rows — fine for
now, just clear the `products` table first if you want a clean re-seed.)

## 4. Run it

```
pnpm dev
```

New pages to try:
- `/` — catalog, with search, category filter, and currency switcher
- `/products/[id]` — product detail page
- `/cart` — cart with quantity controls
- `/checkout` — shipping form → redirects to Chapa's test checkout
- `/order-confirmation/[id]` — verifies payment with Chapa, shows the order,
  triggers the confirmation email
- `/sign-in`, `/sign-up` — Better Auth email/password
- `/account/orders` — order history for the signed-in user
- `/admin` — dashboard (stats, product & order management) — admin only
- `/wishlist` — saved items (heart icon on any product card or detail page)
- `/account` — profile (photo, name, currency, change password) — signed in only
- `/about`, `/contact`, `/privacy` — the pages your nav/footer links point to

Light/dark/system theme is in the header now too (sun/moon icon).

## 5. Make yourself an admin

Sign up for an account through `/sign-up` first, then run:

```
pnpm make-admin you@example.com
```

This flips your `role` to `"admin"` directly in the database. The "Admin
dashboard" link then shows up in your account menu in the header.

## 6. Testing a Chapa payment

Chapa's test mode has its own sandbox test cards/instructions in the
[testing docs](https://developer.chapa.co/test/testing-cards) — check there
for current test card numbers and mobile money test flows, since Chapa
updates these periodically.

The checkout flow uses both a browser redirect back to your site *and* a
server-to-server callback (`/api/chapa/callback`) that Chapa calls
directly — the callback is the more reliable of the two, since it still
fires even if the customer closes their browser right after paying. For
local testing, the callback URL (`NEXT_PUBLIC_APP_URL` + `/api/chapa/callback`)
needs to be reachable from the internet, not just `localhost` — a tool like
[ngrok](https://ngrok.com) can tunnel that while you're developing. Without
it, the browser-redirect verification on the confirmation page still works
fine on its own for a demo.

## 7. Before you commit

```
git init
```

`.gitignore` now excludes `.env` (it didn't before), so this is safe to run
whenever you're ready.

## Email sending

Sending from `admin@ecofurnish.abrdns.com`, a Cloudflare-managed domain —
`FROM_ADDRESS` in `lib/email.ts`. A previous domain on a free shared
subdomain service (de5.net) had bounce issues, most likely inherited
reputation problems common to that kind of shared domain — using a
domain with real DNS control fixed that.

If an email ever doesn't show up: check your terminal first. Every send
is wrapped in a try/catch that logs the real error
(`console.error("Failed to send...")`) instead of failing silently. See
`TESTING.md` for a full checklist of every email the app sends and how to
trigger each one.

One thing a verified sending domain does *not* give you: an inbox.
Verifying a domain on Resend lets your app send mail *from* it — it
doesn't mean that address can *receive* mail you could check in Gmail or
anywhere else. If you want replies to land somewhere you can actually
read, you'd need real email hosting for that domain (Google Workspace,
Zoho Mail, etc.) — separate from Resend, which only handles outbound
sending.

### If email lands in spam instead of the inbox

Different problem than bouncing — this means it's delivering, just not
trusted yet. Normal for a brand-new sending domain; providers weigh a
domain's sending history, and a domain with zero history looks
unproven regardless of how correctly it's configured. A few things that
help, some already built in:

- Every email now includes a plain-text version alongside the HTML —
  HTML-only mail is a real spam signal, since it's what mass-mailing
  tools typically send and legitimate mail typically doesn't.
- The newsletter email has proper one-click unsubscribe support
  (`List-Unsubscribe` header + a working link, handled by
  `app/api/newsletter/unsubscribe/route.ts`) — Gmail and Yahoo have
  required this for bulk senders since their 2024 policy changes, and
  missing it hurts deliverability even for otherwise-legitimate mail.
- Confirm all three DNS records are set: SPF, DKIM, **and** DMARC. Resend's
  dashboard shows exactly which to add. DMARC specifically is easy to
  miss and increasingly expected even for low-volume senders.
- In Gmail, mark a test email "Not spam" — this is a real, if small,
  positive signal for that domain going forward.
- Send a handful of test emails spread over a few days rather than a
  burst all at once; sending patterns that look organic build trust
  faster than a pile of identical test sends in one minute.
- This genuinely does improve with time and consistent sending — there's
  no single setting that fixes it instantly for a new domain.

## Email verification is required now

Signing up no longer logs someone straight in — `lib/auth.ts` has
`requireEmailVerification: true`, so a verification link is emailed on
sign-up (`sendOnSignUp: true`) and sign-in is blocked until it's clicked.
No new database migration needed for this — `emailVerified` and the
verification-token table are already part of Better Auth's core schema
from your first `pnpm auth:migrate`.

## Deleting an account requires email confirmation too

Same idea, using Better Auth's built-in `deleteUser` flow: clicking
"Delete account" in `/account` sends a confirmation link rather than
deleting immediately. Nothing is removed until that link is clicked.

## Profile pictures are a color + icon preset now, not an upload

This changed from the original file-upload approach — no image is
uploaded anywhere. `lib/avatar-presets.ts` defines a set of gradient
colors and eco/furniture-themed icons; the choice is encoded as a small
string (e.g. `preset:emerald-gold:🌿`) and saved directly on the user's
`image` field via `authClient.updateUser()`. This fixes the two real
problems the upload approach had: it works identically on every device
someone signs in from (an uploaded file only lived on the device's local
filesystem), and there's no object-storage service needed at all. The
old `app/api/upload-avatar` route and `AvatarForm` component are gone —
`AvatarPicker` + `AvatarDisplay` replace them everywhere.

## Newsletter signups are stored now

The homepage newsletter form used to have no `onSubmit` handler at all —
clicking Subscribe did nothing. It's real now: emails are saved to a new
`newsletter_subscribers` table and get a confirmation email. Run
`pnpm db:push` again to create that table if you haven't already re-run
it since this update.

## "Remember me" and email verification are two different things

Worth being clear on this since they're easy to conflate: email
verification (the link sent right after signup) is a **one-time** check
— once `emailVerified` is true for an account, it's never asked for
again on future logins. If you ever see it being requested repeatedly for
the same account, that's a bug, not expected behavior.

"Remember me" (the checkbox now on `/sign-in`) is a separate, unrelated
thing: it controls how long you stay signed in. It's a genuinely free,
fully built-in Better Auth feature — `signIn.email({ ..., rememberMe })`.
Checked (the default) gives a normal persistent session (7 days,
refreshed on activity); unchecked gives a short-lived, browser-session-only
login that clears when the tab closes. No new service or config needed.

## If a page you just pulled in doesn't show up

Turbopack's dev cache occasionally doesn't notice brand-new route files.
If a page 404s or renders blank right after merging in updates, stop the
dev server, delete `.next`, and run `pnpm dev` again before assuming
something's actually broken.

## Cart and wishlist are per-account now

Signing in as a different user shows that user's own cart and wishlist,
not whatever was there before — each is stored under a key that includes
the signed-in user's id (falling back to a shared "guest" bucket when
logged out). If you're testing with two accounts in the same browser and
still see the same items, make sure you're fully signed out and back in
between them (not just editing `.env` or opening a second tab).

## Intentionally simplified

- **Profile pictures are saved to the local filesystem**
  (`public/uploads/avatars/`), not real object storage. Fine for
  `pnpm dev`, but won't persist on serverless hosts like Vercel — swap
  `app/api/upload-avatar/route.ts` for Vercel Blob, Cloudinary, or S3
  before deploying somewhere serverless.

- **No refunds/disputes handling.** Chapa supports both — worth adding once
  you're past demo stage.
- **Abandoned checkouts stay as "pending/unpaid" orders forever.** A
  production app would expire these after a while; skipped here for scope.
- **Email failures don't block checkout.** If Resend has an issue, the
  order still completes — it's just logged, not surfaced to the customer.
- **Wishlist is local-storage only, like the cart.** It doesn't sync
  across devices or check live stock — fine for now, but worth moving to
  the database (tied to a user account) if you want it to persist beyond
  one browser.

## If product images ever go blank again

They're expected at `public/products/*.png` — that's what's stored in the
database (`imageUrl` column) and what `db/seed.ts` writes. If you
reorganize `public/` again (e.g. into `public/images/products/`), either
move the files back or update both `db/seed.ts` and any already-seeded
rows to match — the code doesn't care which path, it just needs the DB
value and the actual file to agree.
