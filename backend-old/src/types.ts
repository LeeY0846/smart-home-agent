import type { Device } from "./libs/deviceManager.js";

export type AgentSseEventMap = {
  connected: { jobId: string };
  status: {
    status: "started" | "thinking" | "tool_use" | "completed" | "failed";
  };
  tool_use: { name: string; output: string };
  done: { response: string[] };
  error: { message: string };
};

export type LoopAgentResult = {
  response: string[];
};

export type EmitAgentEvent = <K extends keyof AgentSseEventMap>(
  event: K,
  data: AgentSseEventMap[K],
) => void;

export type AgentJob = {
  id: string;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  devices: Device[];
  result?: string[];
  error?: string;
};
