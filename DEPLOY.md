# Deploying EcoFurnish

Vercel is the natural choice — built by the Next.js team, deploys
straight from GitHub with zero config, and the free tier comfortably
covers a project like this.

## 1. Push to GitHub

```
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then follow its "push an existing repo"
instructions to connect and push.

## 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com), sign up/in with GitHub.
2. **Add New → Project**, select your repo.
3. Vercel auto-detects Next.js — leave build settings as default.
4. Don't click Deploy yet — add environment variables first, or the
   first build fails without them.

## 3. Environment variables

In **Settings → Environment Variables**, add everything from your local
`.env`:

```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
CHAPA_SECRET_KEY
CHAPA_WEBHOOK_SECRET
RESEND_API_KEY
CONTACT_FORM_TO_EMAIL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TELEGRAM_WEBHOOK_SECRET
GEMINI_API_KEY
```

`CRON_SECRET` isn't in this list — Vercel sets it automatically once it
sees the `crons` entry in `vercel.json`, which is already in this repo.
The daily digest (`app/api/cron/daily-digest`) starts running on its own
schedule as soon as this deploys, no extra setup needed beyond the
Telegram/Gemini variables above.

`CHAPA_WEBHOOK_SECRET` also needs its matching webhook URL set in the
Chapa dashboard once you have a real domain: Settings → Webhooks →
`https://<your-domain>/api/chapa/callback`, using the same secret. See
SETUP.md for details.

Two need **different** values than local dev, since they must point at
your real production URL, not `localhost`:

```
NEXT_PUBLIC_APP_URL="https://ecofurnish.de5.net"
BETTER_AUTH_URL="https://ecofurnish.de5.net"
```

## 4. Deploy

Click Deploy. Vercel gives you a `*.vercel.app` URL immediately — good
enough to test everything end to end before connecting your real domain.

## 5. Connect ecofurnish.de5.net

1. In your Vercel project, go to **Settings → Domains**.
2. Add `ecofurnish.de5.net`.
3. Vercel shows you a DNS record to add (usually an A record pointing at
   `76.76.21.21`, or a CNAME — it tells you exactly which).
4. Go to wherever `de5.net` is registered/managed and add that record.
5. Wait for DNS to propagate (usually minutes, sometimes up to a few
   hours) — Vercel's dashboard shows when it's verified.
6. Once verified, update `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to
   `https://ecofurnish.de5.net` if you hadn't already, then redeploy
   (env var changes need a redeploy to take effect — Vercel's dashboard
   has a "Redeploy" button, no need to push new code).

At that point, `https://ecofurnish.de5.net` is live for anyone, anywhere.

## 6. Things that need updating for the real domain

- **Turnstile** — Cloudflare dashboard → your widget → Settings →
  Domains, add `ecofurnish.de5.net`. Keep `localhost` too for continued
  local dev.
- **Chapa** — checkout redirects are built from `NEXT_PUBLIC_APP_URL`
  automatically, so once that's set correctly nothing else to change.
  Re-test one checkout after deploying to confirm the redirect lands back
  on the real domain.
- **Resend** — nothing to change here either, but worth knowing:
  email now sends from `ecofurnish.abrdns.com`, a different (Cloudflare-
  managed) domain than the site itself (`ecofurnish.de5.net`). That's
  intentional, not a mistake to fix — see `SETUP.md`'s email section for
  why. Nothing about deploying the site affects it.
- **`config/site.ts`'s `url` field** — this feeds `metadataBase`, which is
  what the manifest link (`/manifest.webmanifest`), app icons, and Open
  Graph/Twitter preview images get resolved against. It's set to
  `ecofurnish.de5.net` to match where this actually deploys — if you ever
  move to a different domain, update this alongside `NEXT_PUBLIC_APP_URL`
  and `BETTER_AUTH_URL`, or the installable-app manifest and social share
  previews will silently point at the wrong domain.

## 7. Re-run the database setup once against production

If this is a fresh production database (new Neon project, or not seeded
yet), point your local `.env`'s `DATABASE_URL` at production temporarily
and run:

```
pnpm db:push
pnpm auth:migrate
pnpm db:seed
```

These don't run automatically as part of the Vercel build — they're
one-time setup commands, same as they were locally.

## 8. Make your production self an admin

Same as local: sign up for a real account on the live site, then with
production `DATABASE_URL` in `.env` locally, run:

```
pnpm make-admin you@realemail.com
```

## 9. Installable app (PWA)

Nothing extra to configure here — it deploys like any other static file —
but worth knowing what's in place and how to check it:

- **HTTPS is required** for a service worker to register at all. Vercel
  serves everything over HTTPS by default, so this is already satisfied.
- **The service worker only runs in production** (`components/pwa/
  ServiceWorkerRegister.tsx` checks `NODE_ENV`), so you won't see it do
  anything in `next dev` — only after a real deploy, or a local
  `next build && next start`.
- **Updates roll out automatically.** `next.config.mjs` sets `sw.js` to
  `no-cache`, so returning visitors always get the latest service worker
  logic rather than a stale cached copy.
- **To test the install prompt:** open the deployed site on Chrome/Edge
  (desktop or Android) and either wait for the install icon in the address
  bar or the in-page banner, or check DevTools → Application → Manifest
  and Service Workers. On iPhone/iPad or desktop Safari, installation is
  manual (Share → Add to Home Screen, or Share → Add to Dock) — the
  in-page banner shows the right instructions for whichever one it
  detects.
- **If you change the logo later**, the manifest icons
  (`public/icon-192.png`, `icon-512.png`, and the two `icon-maskable-*`
  variants) need regenerating from the new artwork — they're static PNGs,
  not derived from `icon.svg` at build time.

## Everything above should already work — here's the one thing that won't automatically

Nothing in this project needs code changes to deploy — profile
avatars are a color+icon preset (no file storage needed at all, as of
this update), Chapa/Resend/Turnstile all just read from env vars, and
the database is already cloud-hosted (Neon). There's genuinely no
remaining "this breaks on Vercel" gap left to flag.
