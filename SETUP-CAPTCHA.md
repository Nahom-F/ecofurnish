# Getting a Captcha Key (Free)

The sign-up page uses [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
for its captcha. It's completely free — no billing, no credit card, no
usage limits worth worrying about for a project like this. hCaptcha is a
reasonable alternative if you'd rather use that instead, but there's no
need to switch — Turnstile is already wired up and just needs a key.

## Get your keys

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com) and sign
   up (or sign in) — you do **not** need to buy a domain or set up a
   Cloudflare-hosted site for this.
2. In the sidebar, find **Turnstile** and click **Add Widget**.
3. Give it any name (e.g. "EcoFurnish").
4. Under **Domains**, add `localhost` for local development. Add your
   real domain too once you deploy.
5. Widget Mode: choose **Managed** (the default, and the only mode on the
   free plan — it's the good one, decides automatically whether to show
   an interactive challenge or just pass people through invisibly).
6. Click **Create**. You'll get two values:
   - **Site Key** — public, safe to expose in the browser
   - **Secret Key** — private, server-only, never expose this

## Add them to `.env`

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAAA..."
```

Restart `pnpm dev` after adding these — environment variables are only
read when the server starts.

## Testing without a real account yet

Cloudflare publishes fixed test keys that always pass verification, so
you can try the flow before setting up a real widget:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

Don't ship these — they'll pass for anyone, including bots. Swap in your
real keys before this goes anywhere public.

## If the widget doesn't appear

- Check the browser console for errors loading `challenges.cloudflare.com`
- Make sure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set (it must have that
  exact `NEXT_PUBLIC_` prefix, or Next.js won't expose it to the browser)
- Confirm `localhost` is listed under the widget's allowed domains in the
  Cloudflare dashboard
