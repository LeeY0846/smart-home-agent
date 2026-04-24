import type { DeviceAdjustDTO } from "#/actions/types";
import type { Device } from "#/store/smartHomeStore";

export function getDeviceListDTO(devices: Device[]) {
  return devices.map((d) => ({
    name: d.name,
    isPowerOn: d.power === "on" ? true : false,
    value: d.value,
  }));
}

export function adjustDevices(
  currentDevices: Device[],
  adjustment: DeviceAdjustDTO,
) {
  return currentDevices.map((d) => {
    if (d.name !== adjustment.name) return d;
    return { ...d, power: adjustment.power, value: adjustment.value };
  });
}
