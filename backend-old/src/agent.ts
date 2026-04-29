import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts/system.js";
import { readDevices, readWeather, TOOLS, type ToolName } from "./tools.js";
import type { ContentBlock, MessageParam } from "@anthropic-ai/sdk/resources";
import {
  DeviceAdjustDTO,
  DeviceManager,
  type Device,
} from "./libs/deviceManager.js";
import z from "zod";
import type { EmitAgentEvent, LoopAgentResult } from "./types.js";

const apiKey = process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.ANTHROPIC_BASE_URL;
const model = process.env.MODEL_ID || "claude-sonnet-4-6";

const MAX_TOKENS = 512;
const MAX_ITERATION = 10;

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

// export const loopAgent = async (initialMessage: string) => {
//   const context: MessageParam[] = [{ role: "user", content: initialMessage }];
//   const tokenUsage = 0;
//   const manager = new DeviceManager([
//     { name: "kitchen-light", isPowerOn: true },
//     { name: "living-room-air-conditioner", isPowerOn: false, value: 21 },
//     { name: "master-room-air-conditioner", isPowerOn: true, value: 19 },
//   ]);
//   let i = 0;
//   while (i < MAX_ITERATION) {
//     i++;
//     const message = await sendMessage(context);
//     context.push({ role: "assistant", content: message.content });
//     if (message.stop_reason != "tool_use") {
//       return {
//         response: message.content
//           .filter((b) => b.type == "text")
//           .map((b) => b.text),
//       };
//     } else {
//       const results: Anthropic.Messages.ContentBlockParam[] = [];
//       for (let block of message.content) {
//         if (block.type == "tool_use") {
//           console.log(block);
//           console.log(
//             `Tool used - ${block.name} => ${JSON.stringify(block.input)}`,
//           );

//           let output = "No such tool exists";

//           switch (block.name as ToolName) {
//             case "read_weather": {
//               output = readWeather();
//               break;
//             }
//             case "read_devices": {
//               output = readDevices(manager);
//               break;
//             }
//             case "adjust_device": {
//               const result = DeviceAdjustDTO.safeParse(block.input);
//               if (result.success) {
//                 output = manager.adjustDevice(
//                   result.data.device_name,
//                   result.data.power == "on",
//                   result.data.value,
//                 );
//               } else {
//                 output = "Invalid input arguments";
//               }
//               break;
//             }
//             case "read_time": {
//               output = "11:26 PM";
//               break;
//             }
//           }

//           console.log(`Result => ${output}`);

//           results.push({
//             type: "tool_result",
//             tool_use_id: block.id,
//             content: output,
//           });
//         }
//       }
//       context.push({ role: "user", content: results });
//     }
//   }

//   return {
//     response: ["Reached max iteration limit"],
//   };
// };

export async function loopAgent(
  initialMessage: string,
  devices: Device[],
  emit?: EmitAgentEvent,
): Promise<LoopAgentResult> {
  const context: MessageParam[] = [{ role: "user", content: initialMessage }];
  const tokenUsage = 0;
  // const manager = new DeviceManager([
  //   { name: "kitchen-light", isPowerOn: true },
  //   { name: "living-room-air-conditioner", isPowerOn: false, value: 21 },
  //   { name: "master-room-air-conditioner", isPowerOn: true, value: 19 },
  // ]);

  const manager = new DeviceManager(devices);

  emit?.("status", { status: "started" });

  let i = 0;

  while (i < MAX_ITERATION) {
    i++;

    emit?.("status", { status: "thinking" });

    const message = await sendMessage(context);
    context.push({ role: "assistant", content: message.content });

    if (message.stop_reason !== "tool_use") {
      const response = message.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text);

      emit?.("done", { response });

      return { response };
    }

    emit?.("status", { status: "tool_use" });

    const results: Anthropic.Messages.ContentBlockParam[] = [];

    for (const block of message.content) {
      if (block.type !== "tool_use") {
        continue;
      }

      let output = "No such tool exists";

      switch (block.name as ToolName) {
        case "read_weather": {
          output = readWeather();
          break;
        }
        case "read_devices": {
          output = readDevices(manager);
          break;
        }
        case "adjust_device": {
          const result = DeviceAdjustDTO.safeParse(block.input);
          if (result.success) {
            output = manager.adjustDevice(
              result.data.device_name,
              result.data.power === "on",
              result.data.value,
            );
          } else {
            output = "Invalid input arguments";
          }
          break;
        }
        case "read_time": {
          output = "11:26 PM";
          break;
        }
      }

      emit?.("tool_use", { name: block.name, output: output });

      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: output,
      });
    }

    context.push({ role: "user", content: results });
  }

  const response = ["Reached max iteration limit"];
  emit?.("done", { response });
  return { response };
}
