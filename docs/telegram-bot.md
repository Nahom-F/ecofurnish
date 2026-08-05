# Telegram digest bot — setup steps

You already have your bot token from @BotFather, so start at step 2.

### 1. Get a bot token (skip — you have this already)

Message [@BotFather](https://t.me/BotFather) on Telegram, send `/newbot`,
follow the prompts. It replies with a token that looks like
`123456789:AAH8f2Kx...` — that's `TELEGRAM_BOT_TOKEN`.

### 2. Message your bot once

Open a chat with your bot (search its username in Telegram) and send it
anything — literally just "hi". This step matters: Telegram bots can't
message you first, so without this, every send attempt later will
silently fail with no error you'd notice.

### 3. Get your chat ID

With that message sent, visit this URL in any browser, replacing
`<TOKEN>` with your real bot token:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

You'll get back some JSON. Find `"chat"` in it — the `"id"` field next to
it (a number, possibly negative) is your `TELEGRAM_CHAT_ID`. If the JSON
looks empty (`"result":[]`), you skipped step 2 — go send the bot a
message and reload this URL.

### 4. Add both to your local `.env`

```
TELEGRAM_BOT_TOKEN="123456789:AAH8f2Kx..."
TELEGRAM_CHAT_ID="987654321"
```

### 5. (Optional) Add a Gemini key for the rephrased version

Without this, the digest still sends — just as the plain-text version
instead of the rephrased one. To enable it:

1. Go to [aistudio.google.com](https://aistudio.google.com), sign in,
   create an API key. No card required for the free tier.
2. Add it to `.env`:
   ```
   GEMINI_API_KEY="..."
   ```

### 6. Test locally before trusting it

```
pnpm dev
```

Then visit `http://localhost:3000/api/cron/daily-digest` directly in
your browser. This runs the digest immediately (the production-only auth
check is skipped in dev) and:

- Returns the computed numbers as JSON in the browser — check these
  against your actual orders/products before trusting anything further.
- Sends the actual Telegram message — check your chat with the bot.

If nothing arrives in Telegram but the JSON came back fine, that's
almost always step 2 (bot can't message first) or a typo in
`TELEGRAM_CHAT_ID` — re-check both before anything else.

### 7. Deploy

Add the same variables in Vercel: **Settings → Environment Variables**
on your project — `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and
`GEMINI_API_KEY` if you're using it. `vercel.json` (already in the repo)
registers the schedule automatically on deploy — nothing else to
configure.

### 8. Confirm the schedule is live

In the Vercel dashboard: your project → **Settings → Cron Jobs**. You
should see `/api/cron/daily-digest` listed with its schedule. Vercel also
shows a log of past runs there once it's fired at least once, useful for
confirming it's actually running daily without you needing to wait
around for the Telegram message.

A couple of things worth knowing going in:

- Hobby (free) plan cron jobs fire once, sometime within the scheduled
  hour, not at the exact minute — so "7:00 UTC" in `vercel.json` means
  "sometime between 7:00 and 7:59 UTC," not on the dot.
- To change the time, edit the schedule string in `vercel.json` (currently
  `"0 7 * * *"`, cron syntax, always UTC) and redeploy.

## Interactive commands (message the bot, get an answer back)

Everything above is one-way: Vercel pushes a digest to you once a day.
This part is different — it lets you actually message the bot (`/stock`,
`/digest`, `/help`) and get a live reply, on your own schedule. It's a
separate mechanism (a Telegram **webhook**, not the cron job), and needs
its own one-time setup.

### 1. Pick a webhook secret

Any long random string works — this is what proves a request hitting
your site actually came from Telegram, not someone who found the URL.
Generate one however's easiest, e.g. in a terminal:

```
openssl rand -hex 32
```

### 2. Add it to your env vars

```
TELEGRAM_WEBHOOK_SECRET="667c44e5638d0b1caf151a21413c9d6874dcb50bea28ea625df94a76c81d22fe paste-the-random-string-here"
```

Add this in Vercel too (**Settings → Environment Variables**) — the
webhook only runs in production, so it needs to exist there, not just
locally.

### 3. Register the webhook with Telegram

This is a one-time call — after this, Telegram remembers the URL and
starts POSTing every incoming message to it. Visit this in any browser,
filling in your real token, domain, and the secret from step 1:

```
https://api.telegram.org/bot8990206277:AAGlD2MfcRckMwYbduYtfkegsdqcagKV56o/setWebhook?url=https://ecofurnish.de5.net/api/telegram/webhook&secret_token=667c44e5638d0b1caf151a21413c9d6874dcb50bea28ea625df94a76c81d22fe
```

A `{"ok":true,"result":true,...}` response means it's registered.

### 4. Try it

Message your bot `/stock` or `/digest` in Telegram. If nothing comes
back, check Vercel's function logs for `/api/telegram/webhook` — the
route silently no-ops (rather than erroring) for requests that fail the
secret-token check or come from a chat ID other than your own
`TELEGRAM_CHAT_ID`, both deliberate, so check those two values line up
with what you registered above before assuming something's broken.

### If you ever want to stop it

```
https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

Visiting that unregisters it — the bot goes back to purely one-way
(digest only) until you call `setWebhook` again.
