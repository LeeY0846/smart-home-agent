import { describe, it, expect } from 'vitest';
import { readWeather, readDevices, TOOLS } from '../../src/agent/tools';
import { DeviceManager } from '../../src/lib/deviceManager';

describe('readWeather', () => {
	it('returns valid JSON', () => {
		expect(() => JSON.parse(readWeather())).not.toThrow();
	});

	it('includes current, lowest, and highest temperature fields', () => {
		const result = JSON.parse(readWeather());
		expect(result).toHaveProperty('current');
		expect(result).toHaveProperty('lowest');
		expect(result).toHaveProperty('highest');
	});

	it('returns numeric temperature values', () => {
		const result = JSON.parse(readWeather());
		expect(typeof result.current).toBe('number');
		expect(typeof result.lowest).toBe('number');
		expect(typeof result.highest).toBe('number');
	});
});

describe('readDevices', () => {
	it('returns device state from manager', () => {
		const manager = new DeviceManager([{ name: 'kitchen-light', isPowerOn: true }]);
		const result = JSON.parse(readDevices(manager));
		expect(result[0].name).toBe('kitchen-light');
		expect(result[0].power).toBe('on');
	});

	it('returns empty array when no devices', () => {
		const manager = new DeviceManager([]);
		const result = JSON.parse(readDevices(manager));
		expect(result).toHaveLength(0);
	});

	it('reflects device state after adjustment', () => {
		const manager = new DeviceManager([{ name: 'bedroom-ac', isPowerOn: false, value: 21 }]);
		manager.adjustDevice('bedroom-ac', true, 24);
		const result = JSON.parse(readDevices(manager));
		expect(result[0].power).toBe('on');
		expect(result[0].value).toBe(24);
	});
});

describe('TOOLS', () => {
	it('defines read_weather, read_devices, and adjust_device', () => {
		const names = TOOLS.map((t) => t.name);
		expect(names).toContain('read_weather');
		expect(names).toContain('read_devices');
		expect(names).toContain('adjust_device');
	});

	it('adjust_device requires device_name and power', () => {
		const adjustTool = TOOLS.find((t) => t.name === 'adjust_device')!;
		expect(adjustTool.input_schema.required).toContain('device_name');
		expect(adjustTool.input_schema.required).toContain('power');
	});

	it('adjust_device power enum only allows on and off', () => {
		const adjustTool = TOOLS.find((t) => t.name === 'adjust_device')!;
		const powerProp = adjustTool.input_schema.properties.power as { enum: readonly ['on', 'off'] };
		expect(powerProp.enum).toEqual(['on', 'off']);
	});

	it('all tools have a name, description, and input_schema', () => {
		for (const tool of TOOLS) {
			expect(tool).toHaveProperty('name');
			expect(tool).toHaveProperty('description');
			expect(tool).toHaveProperty('input_schema');
		}
	});
});
