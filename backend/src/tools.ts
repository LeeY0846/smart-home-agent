import type { ToolUnion } from "@anthropic-ai/sdk/resources";
import { json } from "zod";

export const TOOLS: ToolUnion[] = [
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
];

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

export function readDevices() {
  return JSON.stringify([
    createDevice("kitchen-light", true),
    createDevice("living-room-air-conditioner", false, 21),
    createDevice("master-room-air-conditioner", true, 19),
  ]);
}

interface DeviceAdjustDTO {
  device_name: string;
  power: "on" | "off";
  value: number;
}

export function adjustDevice(args: Array<any>) {
  console.log("Adjusting Device", ...args);
  return "Device adjusted";
}

export function handleTool(
  toolName: string, // "read_weather" | "read_devices" | "adjust_device",
  args: any,
) {
  switch (toolName) {
    case "read_weather":
      return () => readWeather();
    case "read_devices":
      return () => readDevices();
    case "adjust_device":
      return () => adjustDevice(args);
    default:
      throw new TypeError("No such tool exists");
  }
}
