import { GenerateText } from "./helper";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

// Tokens

dotenv.config();
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  throw new Error(
    "TELEGRAM_TOKEN is missing. Add TELEGRAM_TOKEN to your .env file."
  );
}

const bot = new Telegraf(TELEGRAM_TOKEN);
console.log("Telegram Bot is Online");

bot.use(async (ctx, next) => {
  if (ctx.message && "text" in ctx.message) {
    console.log(
      `${ctx.message?.from?.first_name} Just Sent a Message: ${ctx.message.text}`
    );
  } else {
    console.log(`${ctx.message?.from?.first_name} Just Sent a Message  `);
  }
  await next();
});

bot.command("quit", async (ctx) => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});

bot.start((ctx) => {
  const Name = ctx.from?.first_name || "User";
  const welcomeMessage = `Hello, ${Name}! \nWelcome to your Chatgpt Bot. How can I assist you today?`;
  ctx.reply(welcomeMessage);
});

bot.on("text", async (ctx) => {
  const message = await ctx.reply("Generating...");

  try {
    const generated = await GenerateText(ctx.message.text);
    if (!generated.ok) {
      return ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        ctx.inlineMessageId,
        generated.error
      );
    }
    await ctx.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      ctx.inlineMessageId,
      generated.text || "There was an error while Generating"
    );

    return;
  } catch (error) {
    await ctx.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      ctx.inlineMessageId,
      "There was an error while Generating"
    );
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
