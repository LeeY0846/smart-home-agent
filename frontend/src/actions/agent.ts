import { getDeviceListDTO } from "#/libs/deviceHelper";
import type { Device } from "#/store/smartHomeStore";
import type { CreateAgentResponse } from "./types";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function createAgentJob(
  message: string,
  devices: Device[],
): Promise<CreateAgentResponse> {
  const response = await fetch(BASE_URL + "/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, devices: getDeviceListDTO(devices) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create agent job");
  }

  return response.json() as Promise<CreateAgentResponse>;
}

export function makeEventSource(streamUrl: string) {
  return new EventSource(BASE_URL + streamUrl);
}
