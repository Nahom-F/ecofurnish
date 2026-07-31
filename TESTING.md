# Testing Checklist

A walk-through for verifying everything actually works end to end —
useful after this update, and any time you want to sanity-check before
showing this to someone.

## Email (Resend)

Every email this app sends, and how to trigger each one:

| Email | Triggered by | Where to check if it fails |
|---|---|---|
| Verification link | Signing up at `/sign-up` | Terminal log for `Failed to send verification email` |
| Welcome email | Clicking the verification link | Terminal log for `Failed to send welcome email` |
| Password changed | Changing password in `/account` | Terminal log for `Failed to send password-changed email` |
| Order confirmation | A Chapa payment completing | Terminal log for `Failed to send order confirmation email` |
| Contact form reply | Submitting `/contact` | Terminal log for `Failed to send contact message` |
| Newsletter confirmation | Subscribing on the homepage | Terminal log for `Failed to send newsletter welcome email` |
| Delete account confirmation | Clicking "Delete account" in `/account` | Better Auth's own error, shown as a toast |

For all of these: since `ecofurnish.abrdns.com` is verified, they should
deliver to **any** real email address now, not just your own. If one
doesn't arrive, the terminal running `pnpm dev` is the first place to
look — every send is wrapped in a try/catch that logs the actual error
rather than failing silently.

## Sign-up → verification → sign-in flow

1. Sign up at `/sign-up` with a real email you can check.
2. You should land on a "Check your email" screen, not get logged in
   immediately — this is intentional (`requireEmailVerification: true`).
3. Check your inbox for the verification email, click the link.
4. Try signing in at `/sign-in` — should work now.
5. Try signing in with an email that hasn't been verified — you should
   see the "hasn't been verified yet" screen with a resend option, not a
   generic error.

## Remember me

1. Sign in with "Remember me" checked (the default) — close the browser
   entirely, reopen, visit the site — should still be signed in.
2. Sign out, sign in again with it **unchecked** — close the browser,
   reopen — should be signed out.

## Sign out confirmation

Click "Sign out" in the account menu — should show a confirmation dialog,
not sign out immediately. Cancel should do nothing; confirming should
actually sign out and redirect home.

## Delete account

From `/account` → Danger Zone → Delete account → confirm in the dialog.
You should get a "check your email" message, and the account should
*not* be deleted yet. Nothing to click through further unless you
actually want to delete a real test account — the email link finishes
the deletion.

## Avatar

`/account` → pick any color, optionally an icon → Save. Check it shows
correctly in the header's account menu immediately. Sign in as the same
account from a different browser (or incognito window) — the avatar
should look identical, since it's stored on the account, not the device.

## Currency switching

1. On the homepage catalog, switch the currency dropdown (ETB/USD/GBP) —
   every product card's price should update immediately.
2. Set a preferred currency in `/account` → Currency, save.
3. Reload the homepage — the catalog should default to that currency now
   instead of ETB.
4. Add something to the cart, go to `/cart` — prices should reflect your
   preferred currency, with a small note that checkout charges in ETB.
5. Go to `/checkout` — total is shown in ETB (the real charge amount),
   with a small "≈ [your currency]" underneath if your preference isn't
   ETB.
6. Complete a test payment, check `/order-confirmation/[id]` — same ETB +
   conversion pattern.
7. Check `/account/orders` — order history shows your preferred currency.

## Payments (Chapa)

Full checkout: add items → `/checkout` → fill the form → redirected to
Chapa's hosted page → use Chapa's test payment methods (check
[developer.chapa.co/test/testing-cards](https://developer.chapa.co/test/testing-cards)
for current test card numbers) → should land back on
`/order-confirmation/[id]` showing "Order confirmed," not "Payment
pending." If it's stuck on pending, check the terminal for errors from
`confirmPayment` in `app/actions/orders.ts`.

## Dark mode

Toggle through Light / Dark / System (sun/moon icon in the header) on a
few different pages — homepage, product detail, cart, checkout, account,
admin. Nothing should have invisible or barely-readable text. Pay
particular attention to the Hero section and "Shop by Category" — those
were the ones that had a real contrast bug before this update.

Also check: pick "Light" explicitly — background should have a subtle
green tint. Pick "System" while your OS is in light mode — background
should look plainer/neutral, not the same green tint. That distinction
is intentional, not a bug.

## Mobile

Resize your browser down to ~375px wide (or use real device testing) and
check:
- Hamburger menu opens and all nav links work, then closes properly
- Cart and wishlist rows wrap to two lines instead of overflowing
  horizontally
- Admin product/order tables scroll horizontally instead of getting cut
  off
- Checkout form and account page are usable one-handed

## Every button, link, and form (spot check)

- Footer social icons — only show if you've filled in real URLs in
  `config/site.ts`'s `links` object (empty by default, intentionally
  hidden rather than dead `#` links)
- Newsletter signup on the homepage — should show a loading state, then
  a confirmation message, not just do nothing
- All nav links (`Shop`, `Home`, `Collections`, `About`, `Contact`) —
  should land somewhere real, not 404
- Admin → Products → New/Edit/Delete — all three should work and reflect
  in the catalog immediately
- Admin → Orders → status dropdown — updating it should persist on
  refresh

## Loading states

Throttle your network (browser DevTools → Network → Slow 3G) and
navigate to the homepage, a product page, or `/admin` — you should see
the rotating leaf spinner, not a blank white flash.
