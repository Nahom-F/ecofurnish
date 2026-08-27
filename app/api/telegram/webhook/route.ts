import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, isAuthorizedChat } from "@/lib/telegram";
import { handleCommand } from "@/lib/telegram-commands";

// Telegram's payload shape for the one field we actually read — see
// https://core.telegram.org/bots/api#message for the full shape.
interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

// Telegram POSTs every incoming message here once the webhook is
// registered (a one-time setup call, made separately).
// Always returns 200 — Telegram retries on non-2xx responses, and a
// malformed or unauthorized request isn't something retrying would fix.
export async function POST(request: NextRequest) {
  // Set by Telegram on every webhook request once you register the
  // webhook with a secret_token — confirms this request
  // actually came from Telegram and not some other caller who found the URL.
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  // Only ever reply to the store owner's own chat(s) — this bot exposes
  // real business numbers, so a stranger who finds its username
  // shouldn't be able to just ask it anything. Still replies once,
  // rather than going silent, so a legitimate person trying to get
  // access has something to forward to the admin.
  const chatId = String(message.chat.id);
  if (!isAuthorizedChat(chatId)) {
    await sendTelegramMessage(
      `This bot is only available for the EcoFurnish admin.\n\nIf you should have access, share this with them:\n<code>${chatId}</code>`,
      chatId
    );
    return NextResponse.json({ ok: true });
  }

  const reply = await handleCommand(message.text);
  await sendTelegramMessage(reply);

  return NextResponse.json({ ok: true });
}
