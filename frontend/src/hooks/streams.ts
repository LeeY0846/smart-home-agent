import { useEffect, useRef, useState } from "react";
import type { StreamState } from "./types";
import { useMutation } from "@tanstack/react-query";
import { createAgentJob, makeEventSource } from "#/actions/agent";
import type {
  AgentConnected,
  AgentStatus,
  AgentToolUse,
  AgentDone,
  AgentError,
} from "#/actions/types";
import type { ChatMessage } from "#/store/smartHomeStore";

const initialStreamState: StreamState = {
  jobId: null,
  streamUrl: null,
  status: null,
  text: "",
  toolUses: [],
  finalResponse: [],
  error: null,
};

function parseEventData<T>(event: MessageEvent<string>): T {
  return JSON.parse(event.data) as T;
}

export function useAgentStream(
  addMessage: (
    messageId: string,
    message: string,
    status: ChatMessage["status"],
  ) => void,
  setStreaming: (value: boolean) => void,
) {
  const [state, setState] = useState<StreamState>(initialStreamState);
  const eventSourceRef = useRef<EventSource | null>(null);

  const closeStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      closeStream();
    };
  }, []);

  const createJobMutation = useMutation({
    mutationFn: createAgentJob,
    onMutate: () => {
      closeStream();
      setState(initialStreamState);
    },
    onSuccess: ({ jobId, streamUrl }) => {
      setState((prev) => ({
        ...prev,
        jobId,
        streamUrl,
      }));

      setStreaming(true);

      const eventSource = makeEventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("connected", (event) => {
        const payload = parseEventData<AgentConnected>(
          event as MessageEvent<string>,
        );
        setState((prev) => ({
          ...prev,
          jobId: payload.jobId,
        }));
      });

      eventSource.addEventListener("status", (event) => {
        const payload = parseEventData<AgentStatus>(
          event as MessageEvent<string>,
        );
        setState((prev) => ({
          ...prev,
          status: payload.status,
        }));
      });

      eventSource.addEventListener("tool_use", (event) => {
        const payload = parseEventData<AgentToolUse>(
          event as MessageEvent<string>,
        );
        setState((prev) => ({
          ...prev,
          toolUses: [...prev.toolUses, payload],
        }));

        addMessage(
          crypto.randomUUID(),
          "Planning to use " + payload.name,
          "done",
        );
      });

      eventSource.addEventListener("done", (event) => {
        const payload = parseEventData<AgentDone>(
          event as MessageEvent<string>,
        );
        setState((prev) => ({
          ...prev,
          finalResponse: payload.response,
          status: "completed",
        }));
        setStreaming(false);
        for (const line of payload.response) {
          addMessage(crypto.randomUUID(), line, "done");
        }
        closeStream();
      });

      eventSource.addEventListener("error", (event) => {
        const payload = parseEventData<AgentError>(
          event as MessageEvent<string>,
        );
        setState((prev) => ({
          ...prev,
          error: payload.message,
          status: "failed",
        }));
        setStreaming(false);
        addMessage(
          crypto.randomUUID(),
          "Agent met an error: " + payload.message,
          "done",
        );
        closeStream();
      });
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to create agent job",
      }));
      setStreaming(false);
    },
  });

  const start = async (message: string) => {
    await createJobMutation.mutateAsync(message);
  };

  const reset = () => {
    closeStream();
    setState(initialStreamState);
    createJobMutation.reset();
  };

  return {
    ...state,
    start,
    reset,
    closeStream,
    isPending: createJobMutation.isPending,
    mutationError:
      createJobMutation.error instanceof Error
        ? createJobMutation.error.message
        : null,
  };
}
