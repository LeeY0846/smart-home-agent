import z from "zod";

export const DeviceAdjustDTO = z.object({
  device_name: z.string(),
  power: z.enum(["on", "off"]),
  value: z.number().optional(),
});

export type DeviceAdjustDTO = z.infer<typeof DeviceAdjustDTO>;

export interface Device {
  name: string;
  isPowerOn: boolean;
  value?: number | undefined;
}

export class DeviceManager {
  private devices: Map<string, Device>;

  public constructor(devices: Array<Device>) {
    this.devices = new Map();
    for (const d of devices) {
      if (this.devices.has(d.name)) {
        throw new Error(`Devices have the same name - ${d.name}`);
      }
      this.devices.set(d.name, d);
    }
  }

  public adjustDevice(
    name: string,
    isPowerOn: boolean,
    value?: number,
  ): string {
    if (!this.devices.has(name)) return `${name} does not exist`;

    this.devices.get(name)!.isPowerOn = isPowerOn;
    if (this.devices.get(name)!.value) {
      this.devices.get(name)!.value = value;
    }

    return JSON.stringify({
      name,
      power: isPowerOn ? "on" : "off",
      value,
    });
  }

  public getDevicesJson() {
    return JSON.stringify(
      [...this.devices.values()].map((d) => ({
        name: d.name,
        power: d.isPowerOn ? "on" : "off",
        value: d.value,
      })),
    );
  }
}
