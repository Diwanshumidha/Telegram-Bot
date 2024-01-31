import { GoogleGenerativeAI, BlockReason } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_TOKEN = process.env.GEMINI_TOKEN;
if (!GEMINI_TOKEN) {
  throw new Error(
    "GEMINI_TOKEN is missing. Add GEMINI_TOKEN to your .env file."
  );
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const genAI = new GoogleGenerativeAI(GEMINI_TOKEN);

type TReturnGenerateText =
  | {
      ok: true;
      text: string;
    }
  | {
      ok: false;
      error: string;
    };

const handleError = (error: unknown, fallback?: string): string => {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }

  return fallback || "There was an Error";
};

export async function GenerateText(
  prompt: string
): Promise<TReturnGenerateText> {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings,
  });

  try {
    const { totalTokens } = await model.countTokens(prompt);

    if (totalTokens > 200) {
      throw new Error("Input Message is too long");
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    if (response.promptFeedback?.blockReason === BlockReason.SAFETY) {
      throw new Error("Generated Text contains unsafe content");
    }
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Generated Text is not safe`);
    }
    const text = response.text();
    return { ok: true, text };
  } catch (err) {
    const error = handleError(err, "There was an Error while generating Text");
    return { ok: false, error: error };
  }
}
