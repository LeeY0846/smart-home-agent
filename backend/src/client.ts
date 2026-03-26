import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts/system.js";
import { handleTool, TOOLS } from "./tools.js";
import type { ContentBlock, MessageParam } from "@anthropic-ai/sdk/resources";

const apiKey = process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.ANTHROPIC_BASE_URL;
const model = process.env.MODEL_ID || "claude-sonnet-4-6";

const MAX_TOKENS = 512;

if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY in environment variables");
}

const client = new Anthropic({
  apiKey: apiKey,
  baseURL: baseURL,
});

export const sendMessage = (
  message: Anthropic.Messages.MessageParam[],
  maxTokens = MAX_TOKENS,
) =>
  client.messages.create({
    max_tokens: maxTokens,
    messages: message,
    model: model,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
    },
    tools: TOOLS,
  });

export const streamMessage = (
  message: Anthropic.Messages.MessageParam[],
  maxTokens = MAX_TOKENS,
) =>
  client.messages.stream({
    max_tokens: maxTokens,
    messages: message,
    model: model,
    tools: TOOLS,
  });

export const loopAgent = async (initialMessage: string) => {
  const context: MessageParam[] = [{ role: "user", content: initialMessage }];
  while (true) {
    const message = await sendMessage(context);
    context.push({ role: "assistant", content: message.content });
    if (message.stop_reason != "tool_use") {
      return message;
    } else {
      const results: Anthropic.Messages.ContentBlockParam[] = [];
      for (let block of message.content) {
        if (block.type == "tool_use") {
          const handler = handleTool(block.name, block.input);
          const output = handler();
          results.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: output,
          });
        }
      }
      context.push({ role: "user", content: results });
    }
  }
};
