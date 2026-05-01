import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Device } from '../../src/lib/deviceManager';

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => ({
	default: class MockAnthropic {
		messages = { create: mockCreate };
	},
}));

import { loopAgent } from '../../src/agent/loop';

const devices: Device[] = [
	{ name: 'kitchen-light', isPowerOn: false },
	{ name: 'bedroom-ac', isPowerOn: true, value: 21 },
];

function makeTextResponse(text: string) {
	return {
		stop_reason: 'end_turn',
		content: [{ type: 'text', text }],
	};
}

function makeToolUseResponse(toolName: string, toolId: string, input: object = {}) {
	return {
		stop_reason: 'tool_use',
		content: [{ type: 'tool_use', id: toolId, name: toolName, input }],
	};
}

describe('loopAgent', () => {
	beforeEach(() => {
		mockCreate.mockReset();
	});

	it('returns text response when stop_reason is end_turn', async () => {
		mockCreate.mockResolvedValue(makeTextResponse('Kitchen light is now on.'));

		const result = await loopAgent('Turn on the kitchen light', devices);
		expect(result.response).toContain('Kitchen light is now on.');
	});

	it('emits done event with response text', async () => {
		mockCreate.mockResolvedValue(makeTextResponse('Done.'));

		const events: Array<{ event: string; data: unknown }> = [];
		await loopAgent('Turn on the light', devices, (event, data) => {
			events.push({ event, data });
		});

		const doneEvent = events.find((e) => e.event === 'done');
		expect(doneEvent).toBeDefined();
		expect((doneEvent!.data as { response: string[] }).response).toContain('Done.');
	});

	it('emits thinking status before each API call', async () => {
		mockCreate.mockResolvedValue(makeTextResponse('Done.'));

		const statuses: string[] = [];
		await loopAgent('Turn on the light', devices, (event, data) => {
			if (event === 'status') {
				statuses.push((data as { status: string }).status);
			}
		});

		expect(statuses).toContain('thinking');
	});

	it('executes read_weather tool and feeds result back', async () => {
		mockCreate
			.mockResolvedValueOnce(makeToolUseResponse('read_weather', 'tool_1'))
			.mockResolvedValueOnce(makeTextResponse('The temperature is 23°C.'));

		const result = await loopAgent('What is the temperature?', devices);
		expect(mockCreate).toHaveBeenCalledTimes(2);
		expect(result.response).toContain('The temperature is 23°C.');
	});

	it('executes read_devices tool and feeds result back', async () => {
		mockCreate
			.mockResolvedValueOnce(makeToolUseResponse('read_devices', 'tool_1'))
			.mockResolvedValueOnce(makeTextResponse('There are 2 devices.'));

		const result = await loopAgent('List my devices', devices);
		expect(mockCreate).toHaveBeenCalledTimes(2);
		expect(result.response).toContain('There are 2 devices.');
	});

	it('executes adjust_device tool and updates device state', async () => {
		mockCreate
			.mockResolvedValueOnce(
				makeToolUseResponse('adjust_device', 'tool_1', { device_name: 'kitchen-light', power: 'on' }),
			)
			.mockResolvedValueOnce(makeTextResponse('Kitchen light turned on.'));

		const result = await loopAgent('Turn on the kitchen light', devices);
		expect(result.response).toContain('Kitchen light turned on.');
	});

	it('returns error output for unknown tool', async () => {
		mockCreate
			.mockResolvedValueOnce(makeToolUseResponse('unknown_tool', 'tool_1'))
			.mockResolvedValueOnce(makeTextResponse('Done.'));

		const events: Array<{ event: string; data: unknown }> = [];
		await loopAgent('Do something', devices, (event, data) => {
			events.push({ event, data });
		});

		const toolEvent = events.find((e) => e.event === 'tool_use');
		expect(toolEvent).toBeDefined();
		expect((toolEvent!.data as { output: string }).output).toBe('No such tool exists');
	});

	it('returns error output for invalid adjust_device input', async () => {
		mockCreate
			.mockResolvedValueOnce(makeToolUseResponse('adjust_device', 'tool_1', { bad_field: true }))
			.mockResolvedValueOnce(makeTextResponse('Done.'));

		const events: Array<{ event: string; data: unknown }> = [];
		await loopAgent('Adjust something', devices, (event, data) => {
			events.push({ event, data });
		});

		const toolEvent = events.find((e) => e.event === 'tool_use');
		expect((toolEvent!.data as { output: string }).output).toBe('Invalid input arguments');
	});

	it('stops after 10 iterations when tool_use never resolves', async () => {
		mockCreate.mockResolvedValue(makeToolUseResponse('read_weather', 'tool_1'));

		const result = await loopAgent('Check weather forever', devices);
		expect(mockCreate).toHaveBeenCalledTimes(10);
		expect(result.response).toContain('Reached max iteration limit');
	});

	it('emits done event even on max iteration limit', async () => {
		mockCreate.mockResolvedValue(makeToolUseResponse('read_weather', 'tool_1'));

		const events: Array<{ event: string; data: unknown }> = [];
		await loopAgent('Check weather forever', devices, (event, data) => {
			events.push({ event, data });
		});

		expect(events.some((e) => e.event === 'done')).toBe(true);
	});
});
