import type { ToolUnion } from "@anthropic-ai/sdk/resources";
import type { DeviceManager } from "./libs/deviceManager.js";

export const TOOLS = [
  {
    name: "read_weather",
    description: "Read the current, lowest, and highest temperature.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "read_devices",
    description:
      "Read all devices connected to the smart home agent and their current status. Device names follow kebab-case naming convention, e.g. 'kitchen-light', 'living-room-ac'.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "adjust_device",
    description:
      "Adjust the state of a smart home device. Provide the device name and its new status. For simple devices like lights, status is 'on' or 'off'. For devices like air conditioners, status includes power state and temperature setting.",
    input_schema: {
      type: "object" as const,
      properties: {
        device_name: {
          type: "string",
          description:
            "The name of the device to adjust, in kebab-case, e.g. 'kitchen-light', 'bedroom-ac'.",
        },
        power: {
          type: "string",
          enum: ["on", "off"],
          description: "The power state of the device.",
        },
        value: {
          type: "number",
          description:
            "The setting value for devices that support variable control. For air conditioners, this is the target temperature in Celsius. For fans, this is the gear level e.g. 1, 2, 3.",
        },
      },
      required: ["device_name", "power"],
    },
  },
  {
    name: "read_time",
    description: "Get the current time of the system.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
] as const satisfies ToolUnion[];

export type ToolName = (typeof TOOLS)[number]["name"];

export function readWeather() {
  return JSON.stringify({
    current: 23,
    lowest: 12,
    highest: 25,
  });
}

function createDevice(name: string, isPowerOn: boolean, value?: number) {
  return JSON.stringify({
    device_name: name,
    power: isPowerOn ? "on" : "off",
    value: value,
  });
}

export function readDevices(manager: DeviceManager) {
  return manager.getDevicesJson();
}

interface DeviceAdjustDTO {
  device_name: string;
  power: "on" | "off";
  value: number;
}

export function adjustDevice(...args: Array<any>) {
  console.log("Adjusting Device", ...args);
  return "Device adjusted";
}
