import z from "zod";

export type AgentConnected = { jobId: string };
export type AgentStatus = {
  status: "started" | "thinking" | "tool_use" | "completed" | "failed";
};
export type AgentToolUse = { name: string; output: string };
export type AgentDone = { response: string[] };
export type AgentError = {
  message: string;
};
export type CreateAgentResponse = {
  jobId: string;
  streamUrl: string;
};

export const DeviceAdjustDTO = z.object({
  name: z.string(),
  power: z.enum(["on", "off"]),
  value: z.number().optional(),
});

export type DeviceAdjustDTO = z.infer<typeof DeviceAdjustDTO>;
