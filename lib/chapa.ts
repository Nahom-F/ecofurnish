const CHAPA_API_BASE = "https://api.chapa.co/v1";

if (!process.env.CHAPA_SECRET_KEY) {
  console.warn(
    "CHAPA_SECRET_KEY is not set — checkout will fail until it's added to .env"
  );
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

interface InitializeInput {
  amount: number; // in ETB, decimal allowed
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  txRef: string;
  orderId: string;
  title: string;
}

interface ChapaInitializeResponse {
  status: string; // "success" | "failed"
  // Typed loosely on purpose: Chapa returns a plain string on success,
  // but on a validation failure this can come back as an object keyed by
  // field name instead (e.g. { tx_ref: ["has already been taken"] }) —
  // see normalizeChapaMessage below, which is what actually happened here.
  message: unknown;
  data?: { checkout_url: string };
}

/** Chapa's `message` field isn't reliably a string — on a validation
 * failure it can be an object like { tx_ref: ["has already been taken"] }
 * instead. Passing that object straight to a toast crashes React (that's
 * exactly what happened before this fix), so always reduce it to a plain
 * string first, however it comes back. */
function normalizeChapaMessage(message: unknown): string | null {
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const parts = Object.entries(message as Record<string, unknown>).map(([field, val]) => {
      const text = Array.isArray(val) ? val.join(", ") : String(val);
      return `${field}: ${text}`;
    });
    if (parts.length > 0) return parts.join("; ");
  }
  return null;
}

/** Starts a Chapa transaction and returns the hosted checkout URL to redirect to. */
export async function initializeChapaTransaction(input: InitializeInput) {
  const appUrl = getAppUrl();

  const res = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount.toFixed(2),
      currency: "ETB",
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber,
      tx_ref: input.txRef,
      callback_url: `${appUrl}/api/chapa/callback`,
      return_url: `${appUrl}/order-confirmation/${input.orderId}?tx_ref=${input.txRef}`,
      customization: {
        title: input.title.slice(0, 16), // Chapa caps this field's length
        description: "EcoFurnish order payment",
      },
    }),
  });

  const json: ChapaInitializeResponse = await res.json();

  if (json.status !== "success" || !json.data?.checkout_url) {
    console.error("Chapa initialize failed:", json);
    return { success: false as const, error: normalizeChapaMessage(json.message) || "Couldn't start payment." };
  }

  return { success: true as const, checkoutUrl: json.data.checkout_url };
}

interface ChapaVerifyResponse {
  status: string;
  message: string;
  data?: { status: string; tx_ref: string; amount: string; currency: string };
}

/** Confirms with Chapa's servers (not just the browser redirect) that a transaction actually succeeded. */
export async function verifyChapaTransaction(txRef: string) {
  const res = await fetch(`${CHAPA_API_BASE}/transaction/verify/${txRef}`, {
    headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
  });

  const json: ChapaVerifyResponse = await res.json();
  const paid = json.status === "success" && json.data?.status === "success";

  return { paid, raw: json };
}
