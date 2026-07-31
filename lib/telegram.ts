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
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set — Telegram message not sent.");
    return { success: false as const };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
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
