import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, isAuthorizedChat, answerCallbackQuery } from "@/lib/telegram";
import { handleCommand } from "@/lib/telegram-commands";
import {
  handleUnauthorizedTextMessage,
  handleAccessRequestButtonTap,
} from "@/lib/telegram-access-requests";

// Telegram's payload shape for the fields we actually read — see
// https://core.telegram.org/bots/api#update for the full shape.
interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number } };
  };
}

// Telegram POSTs every incoming message (and every button tap, as a
// separate "callback_query" update) here once the webhook is
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

  // Someone tapped an inline button — currently only "Request Access"
  // exists, but this stays a switch-like check in case more get added.
  if (update.callback_query) {
    const cq = update.callback_query;
    await answerCallbackQuery(cq.id); // dismiss the button's loading spinner regardless
    const chatId = cq.message ? String(cq.message.chat.id) : null;
    if (chatId && cq.data === "request_access") {
      await handleAccessRequestButtonTap(chatId);
    }
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  // Only ever run real commands for the store owner's own chat(s) —
  // this bot exposes real business numbers. Anyone else gets routed
  // through the self-service access-request flow instead of a plain
  // refusal — see lib/telegram-access-requests.ts.
  const chatId = String(message.chat.id);
  if (!(await isAuthorizedChat(chatId))) {
    await handleUnauthorizedTextMessage(chatId, message.text);
    return NextResponse.json({ ok: true });
  }

  const reply = await handleCommand(message.text);
  // Explicitly targets the sender's own chat — without this it always
  // falls back to the first TELEGRAM_CHAT_ID env admin regardless of
  // who actually messaged, which was invisible back when that was the
  // only chat that could ever be authorized, and became a real bug the
  // moment a second admin (via /admin/telegram) could message too.
  await sendTelegramMessage(reply, chatId);

  return NextResponse.json({ ok: true });
}
