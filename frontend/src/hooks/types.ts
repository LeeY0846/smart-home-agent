import type { AgentStatus, AgentToolUse } from "#/actions/types";

export type StreamState = {
  jobId: string | null;
  streamUrl: string | null;
  status: AgentStatus["status"] | null;
  text: string;
  toolUses: AgentToolUse[];
  finalResponse: string[];
  error: string | null;
};
