import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompts/system.js';
import { readDevices, readWeather, TOOLS, type ToolName } from './tools.js';
import type { MessageParam } from '@anthropic-ai/sdk/resources';
import { DeviceAdjustDTO, DeviceManager, type Device } from '../lib/deviceManager.js';
import { env } from 'cloudflare:workers';
import type { EmitAgentEvent, LoopAgentResult } from '../types.js';

const apiKey = env.ANTHROPIC_API_KEY;
const baseURL = env.ANTHROPIC_BASE_URL;
const model = env.MODEL_ID || 'claude-sonnet-4-6';

const MAX_TOKENS = 512;
const MAX_ITERATION = 10;

if (!apiKey) {
	throw new Error('Missing ANTHROPIC_API_KEY in environment variables');
}

const client = new Anthropic({
	apiKey: apiKey,
	baseURL: baseURL,
});

export const sendMessage = (message: Anthropic.Messages.MessageParam[], maxTokens = MAX_TOKENS) =>
	client.messages.create({
		max_tokens: maxTokens,
		messages: message,
		model: model,
		system: SYSTEM_PROMPT,
		output_config: {
			effort: 'low',
		},
		tools: TOOLS,
	});

export const streamMessage = (message: Anthropic.Messages.MessageParam[], maxTokens = MAX_TOKENS) =>
	client.messages.stream({
		max_tokens: maxTokens,
		messages: message,
		model: model,
		tools: TOOLS,
	});

export async function loopAgent(initialMessage: string, devices: Device[], emit?: EmitAgentEvent): Promise<LoopAgentResult> {
	const context: MessageParam[] = [{ role: 'user', content: initialMessage }];
	const manager = new DeviceManager(devices);

	emit?.('status', { status: 'started' });

	let i = 0;

	while (i < MAX_ITERATION) {
		i++;

		emit?.('status', { status: 'thinking' });

		const message = await sendMessage(context);
		context.push({ role: 'assistant', content: message.content });

		if (message.stop_reason !== 'tool_use') {
			const response = message.content.filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text').map((b) => b.text);

			emit?.('done', { response });

			return { response };
		}

		emit?.('status', { status: 'tool_use' });

		const results: Anthropic.Messages.ContentBlockParam[] = [];

		for (const block of message.content) {
			if (block.type !== 'tool_use') {
				continue;
			}

			let output = 'No such tool exists';

			switch (block.name as ToolName) {
				case 'read_weather': {
					output = readWeather();
					break;
				}
				case 'read_devices': {
					output = readDevices(manager);
					break;
				}
				case 'adjust_device': {
					const result = DeviceAdjustDTO.safeParse(block.input);
					if (result.success) {
						output = manager.adjustDevice(result.data.device_name, result.data.power === 'on', result.data.value);
					} else {
						output = 'Invalid input arguments';
					}
					break;
				}
			}

			emit?.('tool_use', { name: block.name, output: output });

			results.push({
				type: 'tool_result',
				tool_use_id: block.id,
				content: output,
			});
		}

		context.push({ role: 'user', content: results });
	}

	const response = ['Reached max iteration limit'];
	emit?.('done', { response });
	return { response };
}
