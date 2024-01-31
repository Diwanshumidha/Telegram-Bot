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

bot.start((ctx) => {
  const Name = ctx.from?.first_name || "User";
  const welcomeMessage = `Hello, ${Name}! \nWelcome to your Chatgpt Bot. How can I assist you today?`;
  ctx.reply(welcomeMessage);
});

bot.command("about", (ctx) => {
  const aboutMessage = `🤖 *Chatgpt \\- Your Friendly Telegram Bot*

  I am here to assist you with various tasks and provide information\\. Feel free to ask me anything\\!
  
  🛠 **Features:**
  \\- **Command List:** Type /help to see a list of available commands\\.
  \\- **Customized Responses:** I can respond to specific commands and queries\\.
  
  📬 **Contact:**
  If you have any questions or issues, feel free to contact my creator\\.
  
  👩‍💻 **Creator:**
  [Diwanshu Midha](https://diwanshumidha\\.vercel\\.app/)
  
  Enjoy using chatGPT\\! 🚀`;

  ctx.replyWithMarkdownV2(aboutMessage);
});

bot.command("help", (ctx) => {
  const helpMessage = `🤖 **ChatGPT Bot Commands:**

\\- **/start:** Start a conversation with the bot\\.
\\- **/about:** Learn more about the bot\\.
\\- **/joke \\[topic\\]  :**  Generate a Joke\\.
\\- **/quote \\[topic\\]  :** Generate a Quote\\.
\\- **/help:** Display this help message\\.

For any other messages, the bot will generate responses based on the input\\.

Feel free to explore and ask questions\\! 🚀`;

  ctx.replyWithMarkdownV2(helpMessage);
});

bot.command("quote", async (ctx) => {
  const message = await ctx.reply("Fetching a quote...");
  const quoteTopic = ctx.message.text.replace("/quote", "") || "any";

  try {
    const generated = await GenerateText(
      `Generate An Motivational Quote that is related to ${quoteTopic} topic. NOTE: Just Include Quote and Author Name without any extra information `
    );

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

bot.command("joke", async (ctx) => {
  const message = await ctx.reply("Generating a joke...");
  const jokeTopic = ctx.message.text.replace("/joke", "") || "any";

  try {
    const generated = await GenerateText(
      `Generate A Funny Joke related to ${jokeTopic} topic. NOTE: Just Include Joke without any extra information `
    );

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
