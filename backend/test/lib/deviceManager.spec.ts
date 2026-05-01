import { describe, it, expect } from 'vitest';
import { DeviceManager, DeviceAdjustDTO } from '../../src/lib/deviceManager';

describe('DeviceManager', () => {
	describe('constructor', () => {
		it('initializes with given devices', () => {
			const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: false }]);
			const devices = JSON.parse(manager.getDevicesJson());
			expect(devices).toHaveLength(1);
			expect(devices[0].name).toBe('kitchen-light');
		});

		it('throws on duplicate device names', () => {
			expect(
				() =>
					new DeviceManager([
						{ name: 'kitchen-light', isPowerOn: false },
						{ name: 'kitchen-light', isPowerOn: true },
					]),
			).toThrow('Devices have the same name - kitchen-light');
		});

		it('initializes with an empty list', () => {
			const manager = new DeviceManager([]);
			expect(JSON.parse(manager.getDevicesJson())).toHaveLength(0);
		});
	});

	describe('adjustDevice', () => {
		it('powers on a device', () => {
			const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: false }]);
			const result = JSON.parse(manager.adjustDevice('kitchen-light', true));
			expect(result.name).toBe('kitchen-light');
			expect(result.power).toBe('on');
		});

		it('powers off a device', () => {
			const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: true }]);
			const result = JSON.parse(manager.adjustDevice('kitchen-light', false));
			expect(result.power).toBe('off');
		});

		it('updates value on devices that have one', () => {
			const manager = new DeviceManager([{ name: 'bedroom-ac', isPowerOn: true, value: 21 }]);
			const result = JSON.parse(manager.adjustDevice('bedroom-ac', true, 25));
			expect(result.value).toBe(25);
		});

		it('does not persist value on devices that do not have one', () => {
			const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: false }]);
			manager.adjustDevice('kitchen-light', true, 25);
			const devices = JSON.parse(manager.getDevicesJson());
			expect(devices[0].value).toBeUndefined();
		});

		it('persists power change when read back', () => {
			const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: false }]);
			manager.adjustDevice('kitchen-light', true);
			const devices = JSON.parse(manager.getDevicesJson());
			expect(devices[0].power).toBe('on');
		});

		it('returns error message for unknown device', () => {
			const manager = new DeviceManager([]);
			expect(manager.adjustDevice('nonexistent', true)).toBe('nonexistent does not exist');
		});
	});

	describe('getDevicesJson', () => {
		it('normalizes isPowerOn to power: on/off string', () => {
			const manager = new DeviceManager([
				{ name: 'kitchen-light', isPowerOn: true },
				{ name: 'bedroom-ac', isPowerOn: false, value: 22 },
			]);
			const devices = JSON.parse(manager.getDevicesJson());
			expect(devices[0].power).toBe('on');
			expect(devices[1].power).toBe('off');
		});

		it('includes value for devices that have one', () => {
			const manager = new DeviceManager([{ name: 'bedroom-ac', isPowerOn: true, value: 22 }]);
			const devices = JSON.parse(manager.getDevicesJson());
			expect(devices[0].value).toBe(22);
		});

		it('returns all devices', () => {
			const manager = new DeviceManager([
				{ name: 'kitchen-light', isPowerOn: true },
				{ name: 'bedroom-ac', isPowerOn: false, value: 22 },
				{ name: 'living-room-fan', isPowerOn: true },
			]);
			expect(JSON.parse(manager.getDevicesJson())).toHaveLength(3);
		});
	});
});

describe('DeviceAdjustDTO', () => {
	it('accepts valid on input', () => {
		const result = DeviceAdjustDTO.safeParse({ device_name: 'kitchen-light', power: 'on' });
		expect(result.success).toBe(true);
	});

	it('accepts valid off input with optional value', () => {
		const result = DeviceAdjustDTO.safeParse({ device_name: 'bedroom-ac', power: 'off', value: 22 });
		expect(result.success).toBe(true);
	});

	it('rejects invalid power value', () => {
		const result = DeviceAdjustDTO.safeParse({ device_name: 'kitchen-light', power: 'toggle' });
		expect(result.success).toBe(false);
	});

	it('rejects missing device_name', () => {
		const result = DeviceAdjustDTO.safeParse({ power: 'on' });
		expect(result.success).toBe(false);
	});

	it('rejects missing power', () => {
		const result = DeviceAdjustDTO.safeParse({ device_name: 'kitchen-light' });
		expect(result.success).toBe(false);
	});

	it('rejects non-number value', () => {
		const result = DeviceAdjustDTO.safeParse({ device_name: 'bedroom-ac', power: 'on', value: 'warm' });
		expect(result.success).toBe(false);
	});
});
