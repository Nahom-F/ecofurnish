import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Verified domain (Cloudflare-managed DNS). A previous domain on a free
// shared-subdomain service (de5.net) had bounce issues, most likely from
// inherited reputation problems common to that kind of shared domain.
const FROM_ADDRESS = "EcoFurnish <admin@ecofurnish.abrdns.com>";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Shown at the bottom of every email sent to a customer (not the
// owner-facing ones like contact-form/low-stock alerts, which land in an
// inbox we already control). Resend's shared sending domain means first
// emails to a given address sometimes land in spam — this nudges people to
// check there, and marking it "not spam" also helps whatever we send that
// same person next actually reach their inbox.
const SPAM_NOTE_TEXT =
  'Didn\'t see this in your inbox? Check your spam or junk folder — marking it "not spam" helps future emails land there directly.';
const SPAM_NOTE_HTML = `<p style="color:#9a9890;font-size:12px;margin-top:16px;">Didn't see this in your inbox? Check your spam or junk folder — marking it "not spam" helps future emails land there directly.</p>`;

export async function sendNewsletterWelcomeEmail(toEmail: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — newsletter welcome email was not sent.");
    return { success: false as const };
  }

  const unsubscribeUrl = `${appUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(toEmail)}`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "You're on the list",
      // Gmail/Yahoo require one-click unsubscribe for bulk mail since
      // their 2024 policy changes — this is what makes that work.
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      text: `You're subscribed!\n\nThanks for joining the EcoFurnish newsletter — expect the occasional email about new pieces, offers, and what your plastic-diverted total is doing for the planet.\n\nUnsubscribe: ${unsubscribeUrl}\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">You're subscribed!</h2>
          <p style="color:#3a3f38;">
            Thanks for joining the EcoFurnish newsletter — expect the occasional email about
            new pieces, offers, and what your plastic-diverted total is doing for the planet.
          </p>
          <p style="color:#9a9890;font-size:12px;margin-top:32px;border-top:1px solid #e0ddd0;padding-top:16px;">
            <a href="${unsubscribeUrl}" style="color:#9a9890;">Unsubscribe</a>
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
    return { success: true as const };
  } catch (err) {
    console.error("Failed to send newsletter welcome email:", err);
    return { success: false as const };
  }
}

export async function sendVerificationEmail(toEmail: string, url: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — verification email was not sent.");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Verify your EcoFurnish email",
      text: `Verify your email\n\nClick the link below to verify your email address and activate your EcoFurnish account.\n\n${url}\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Verify your email</h2>
          <p style="color:#3a3f38;">
            Click below to verify your email address and activate your EcoFurnish account.
          </p>
          <p style="margin:24px 0;">
            <a href="${url}" style="background:#33472e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
              Verify email
            </a>
          </p>
          <p style="color:#6b6a5c;font-size:13px;">
            If the button doesn't work, copy and paste this link: ${url}
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }
}

export async function sendResetPasswordEmail(toEmail: string, url: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — reset-password email was not sent.");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Reset your EcoFurnish password",
      text: `Reset your password\n\nSomeone requested a password reset for this EcoFurnish account. If that was you, use the link below — it expires soon.\n\n${url}\n\nIf this wasn't you, ignore this email — your password hasn't been changed.\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Reset your password</h2>
          <p style="color:#3a3f38;">
            Someone requested a password reset for this EcoFurnish account. If that was you,
            click below to choose a new one — this link expires soon.
          </p>
          <p style="margin:24px 0;">
            <a href="${url}" style="background:#33472e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
              Reset password
            </a>
          </p>
          <p style="color:#6b6a5c;font-size:13px;">
            If this wasn't you, ignore this email — your password hasn't been changed.
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send reset-password email:", err);
  }
}

export async function sendDeleteAccountEmail(toEmail: string, url: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — delete-account email was not sent.");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Confirm account deletion",
      text: `Confirm account deletion\n\nSomeone requested to permanently delete this EcoFurnish account. If that was you, use the link below to confirm — this can't be undone.\n\n${url}\n\nIf this wasn't you, ignore this email — your account is safe.\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#b3432d;">Confirm account deletion</h2>
          <p style="color:#3a3f38;">
            Someone requested to permanently delete this EcoFurnish account. If that was you,
            click below to confirm — this can't be undone.
          </p>
          <p style="margin:24px 0;">
            <a href="${url}" style="background:#b3432d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
              Confirm deletion
            </a>
          </p>
          <p style="color:#6b6a5c;font-size:13px;">
            If this wasn't you, ignore this email — your account is safe.
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send delete-account email:", err);
  }
}

export async function sendWelcomeEmail(toEmail: string, name: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — welcome email was not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Welcome to EcoFurnish",
      text: `Welcome, ${name.split(" ")[0]}!\n\nYour EcoFurnish account is ready. Browse the catalog, save favorites to your wishlist, and your orders will show up in your account once you check out.\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Welcome, ${name.split(" ")[0]}!</h2>
          <p style="color:#3a3f38;">
            Your EcoFurnish account is ready. Browse the catalog, save favorites to your
            wishlist, and your orders will show up in your account once you check out.
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

export async function sendPasswordChangedEmail(toEmail: string, name: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — password-changed email was not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Your EcoFurnish password was changed",
      text: `Password changed\n\nHi ${name.split(" ")[0]}, this confirms your EcoFurnish account password was just changed.\n\nIf this wasn't you, contact us immediately through the site's contact page.\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Password changed</h2>
          <p style="color:#3a3f38;">
            Hi ${name.split(" ")[0]}, this confirms your EcoFurnish account password was just changed.
          </p>
          <p style="color:#6b6a5c;font-size:14px;">
            If this wasn't you, contact us immediately through the site's contact page.
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send password-changed email:", err);
  }
}

export async function sendExistingAccountSignUpAttemptEmail(toEmail: string, name: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — existing-account notice email was not sent.");
    return;
  }

  const signInUrl = `${appUrl()}/sign-in`;
  const forgotPasswordUrl = `${appUrl()}/forgot-password`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "Someone tried to sign up with your EcoFurnish email",
      text: `Hi ${name.split(" ")[0]},\n\nSomeone just tried to create a new EcoFurnish account using this email address, which already has an account.\n\nIf that was you, you don't need a new account — just sign in: ${signInUrl}\n\nForgot your password? Reset it here: ${forgotPasswordUrl}\n\nIf this wasn't you, no action is needed — your account is safe and no new account was created.\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Someone tried to sign up with your email</h2>
          <p style="color:#3a3f38;">
            Hi ${name.split(" ")[0]}, someone just tried to create a new EcoFurnish account
            using this email address — but you already have one.
          </p>
          <p style="color:#3a3f38;">
            If that was you, you don't need a new account. Just sign in below:
          </p>
          <p style="margin:24px 0;">
            <a href="${signInUrl}" style="background:#33472e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
              Sign in
            </a>
          </p>
          <p style="color:#6b6a5c;font-size:13px;">
            Forgotten your password? <a href="${forgotPasswordUrl}" style="color:#33472e;">Reset it here</a>.
          </p>
          <p style="color:#6b6a5c;font-size:13px;margin-top:16px;border-top:1px solid #e0ddd0;padding-top:16px;">
            If this wasn't you, no action is needed — your account is safe and no new account was created.
          </p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send existing-account notice email:", err);
  }
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  message: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — contact message was not sent.");
    return { success: false as const };
  }

  const ownerEmail = process.env.CONTACT_FORM_TO_EMAIL;
  if (!ownerEmail) {
    console.warn("CONTACT_FORM_TO_EMAIL is not set — contact message was not sent.");
    return { success: false as const };
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ownerEmail,
      replyTo: input.email,
      subject: `New contact form message from ${input.name}`,
      text: `New message from your site\n\n${input.name} (${input.email}) wrote:\n\n${input.message}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">New message from your site</h2>
          <p><strong>${input.name}</strong> (${input.email}) wrote:</p>
          <p style="white-space:pre-wrap;color:#3a3f38;">${input.message}</p>
        </div>
      `,
    });
    return { success: true as const };
  } catch (err) {
    console.error("Failed to send contact message:", err);
    return { success: false as const };
  }
}

interface OrderEmailItem {
  productName: string;
  unitPrice: string;
  quantity: number;
}

interface OrderConfirmationEmailInput {
  toEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: string;
  items: OrderEmailItem[];
}

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — skipping order confirmation email.");
    return;
  }

  const itemsHtml = input.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:#3a3f38;">${item.productName} × ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;color:#3a3f38;">Br${(
            parseFloat(item.unitPrice) * item.quantity
          ).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const itemsText = input.items
    .map((item) => `${item.productName} × ${item.quantity} — Br${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}`)
    .join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#33472e;">Thanks for your order, ${input.customerName.split(" ")[0]}!</h2>
      <p style="color:#3a3f38;">Your EcoFurnish order <strong>#${input.orderId.slice(0, 8)}</strong> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0 0;border-top:1px solid #e0ddd0;font-weight:600;">Total</td>
          <td style="padding:12px 0 0;border-top:1px solid #e0ddd0;text-align:right;font-weight:600;">
            Br${parseFloat(input.totalAmount).toFixed(2)}
          </td>
        </tr>
      </table>
      <p style="color:#6b6a5c;font-size:14px;margin-top:24px;">
        We'll be in touch about delivery. Thanks for supporting sustainable furniture.
      </p>
      ${SPAM_NOTE_HTML}
    </div>
  `;

  const text = `Thanks for your order, ${input.customerName.split(" ")[0]}!\n\nYour EcoFurnish order #${input.orderId.slice(0, 8)} is confirmed.\n\n${itemsText}\n\nTotal: Br${parseFloat(input.totalAmount).toFixed(2)}\n\nWe'll be in touch about delivery. Thanks for supporting sustainable furniture.\n\n${SPAM_NOTE_TEXT}`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: input.toEmail,
      subject: `Your EcoFurnish order #${input.orderId.slice(0, 8)} is confirmed`,
      text,
      html,
    });
  } catch (err) {
    // Don't let an email failure break the checkout flow — just log it.
    console.error("Failed to send order confirmation email:", err);
  }
}

/** Fired at the moment a purchase drops a product to low stock — a
 * one-off nudge rather than something that needs its own schedule, since
 * lib/insights.ts's daily digest already covers the broader trend. Reuses
 * CONTACT_FORM_TO_EMAIL (the owner's inbox) rather than adding a new env
 * var for what's conceptually the same "email the owner" destination. */
export async function sendLowStockAlertEmail(productName: string, stock: number) {
  const ownerEmail = process.env.CONTACT_FORM_TO_EMAIL;
  if (!ownerEmail) {
    console.warn("CONTACT_FORM_TO_EMAIL is not set — low-stock alert was not sent.");
    return;
  }
  if (!resend) {
    console.warn("RESEND_API_KEY is not set — low-stock alert was not sent.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ownerEmail,
      subject: `Low stock: ${productName} (${stock} left)`,
      text: `${productName} just dropped to ${stock} in stock after a purchase. Might be worth reordering soon.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">Low stock alert</h2>
          <p style="color:#3a3f38;"><strong>${productName}</strong> just dropped to
          <strong>${stock}</strong> in stock after a purchase. Might be worth reordering soon.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send low-stock alert email:", err);
  }
}

const STATUS_EMAIL_COPY = {
  processing: {
    subject: "Your order is confirmed",
    heading: "Your order is confirmed",
    body: () => "We've started getting your order ready.",
  },
  shipped: {
    subject: "Your order has shipped",
    heading: "Your order has shipped",
    body: (trackingNote?: string | null) =>
      trackingNote
        ? `Your order is on its way. Tracking: ${trackingNote}`
        : "Your order is on its way.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Delivered!",
    body: () => "Your order has been marked as delivered. We hope you love it.",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    heading: "Order cancelled",
    body: () => "Your order has been cancelled. If this wasn't expected, just reply to this email.",
  },
} as const;

/** Fired from the admin panel whenever an order's status changes —
 * "pending" is deliberately not in STATUS_EMAIL_COPY (that's the default
 * state right after checkout, already covered by the order-confirmation
 * email above, not a status change an admin triggers). Silently does
 * nothing for any other status, so this is safe to call unconditionally. */
export async function sendOrderStatusUpdateEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  status: string,
  trackingNote?: string | null
) {
    const copy = STATUS_EMAIL_COPY[status as keyof typeof STATUS_EMAIL_COPY];
  if (!copy) return;

  if (!resend) {
    console.warn("RESEND_API_KEY is not set — order status email was not sent.");
    return;
  }

  const firstName = customerName.split(" ")[0];
  const bodyText = copy.body(trackingNote);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `${copy.subject} — order #${orderId.slice(0, 8)}`,
      text: `${copy.heading}\n\nHi ${firstName}, ${bodyText}\n\nOrder #${orderId.slice(0, 8)}\n\n${SPAM_NOTE_TEXT}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#33472e;">${copy.heading}</h2>
          <p style="color:#3a3f38;">Hi ${firstName}, ${bodyText}</p>
          <p style="color:#6b6a5c;font-size:13px;">Order #${orderId.slice(0, 8)}</p>
          ${SPAM_NOTE_HTML}
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send order status email:", err);
  }
}
