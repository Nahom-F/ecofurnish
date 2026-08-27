// Sends messages to your personal Telegram chat via the Bot API.
//
// Setup:
// 1. Message @BotFather on Telegram, run /newbot, copy the token it gives
//    you into TELEGRAM_BOT_TOKEN.
// 2. Message your new bot anything (e.g. "hi") so it's allowed to message
//    you back — bots can't message a chat first.
// 3. Get your chat ID: visit
//    https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates in a browser
//    right after step 2, and read the numeric "id" under "chat" in the
//    JSON response. Put that in TELEGRAM_CHAT_ID.
// 4. To allow more than one person, put a comma-separated list in
//    TELEGRAM_CHAT_ID (e.g. "111111,222222") — no code change needed.
//    An easier way to get a new person's ID than repeating step 3:
//    have them just message the bot once. It replies to anyone not yet
//    on the list with their own chat ID, ready to copy into the env var.
export async function sendTelegramMessage(text: string, chatId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId ?? process.env.TELEGRAM_CHAT_ID?.split(",")[0]?.trim();

  if (!token || !targetChatId) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set — Telegram message not sent.");
    return { success: false as const };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram API error:", res.status, body);
      return { success: false as const };
    }
    return { success: true as const };
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return { success: false as const };
  }
}

/** True if this chat ID is one of the allowed admin chats.
 * TELEGRAM_CHAT_ID supports a comma-separated list, so more than one
 * person can use the bot with no code change — just editing the env var. */
export function isAuthorizedChat(chatId: string): boolean {
  const allowed = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(chatId);
}
