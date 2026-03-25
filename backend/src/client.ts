import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts/system.js";

const apiKey = process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.ANTHROPIC_BASE_URL;
const model = process.env.MODEL_ID || "claude-sonnet-4-6";

if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY in environment variables");
}

const system = "You are a smart ";

const client = new Anthropic({
  apiKey: apiKey,
  baseURL: baseURL,
});

export const sendMessage = (
  message: Anthropic.Messages.MessageParam[],
  maxTokens = 256,
) =>
  client.messages.create({
    max_tokens: maxTokens,
    messages: message,
    model: model,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
    },
  });

export const streamMessage = (
  message: Anthropic.Messages.MessageParam[],
  maxTokens = 256,
) =>
  client.messages.stream({
    max_tokens: maxTokens,
    messages: message,
    model: model,
  });
