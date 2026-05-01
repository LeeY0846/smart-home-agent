import { Router } from 'express';
import { env } from 'cloudflare:workers';
import { loopAgent } from '../agent/loop.js';
import { type Response, type Request } from 'express';
import type { AgentJob, AgentSseEventMap } from '../types.js';
import z from 'zod';
import type { Device } from '../lib/deviceManager.js';
import { logEntry } from '../lib/logger.js';

const router = Router();

function setupSseHeaders(res: Response): void {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache, no-transform');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('X-Accel-Buffering', 'no');
	res.flushHeaders();
}

function writeSse<K extends keyof AgentSseEventMap>(res: Response, event: K, data: AgentSseEventMap[K]) {
	res.write(`event: ${event}\n`);
	res.write(`data: ${JSON.stringify(data)}\n\n`);
}

router.post('/', async (req: Request<{}, {}, { message?: string; devices: Device[] }>, res) => {
	const { message, devices } = req.body;
	const result = z.string().safeParse(message);
	if (!result.success) {
		res.status(400).json({ error: 'message is required' });
		return;
	}

	const jobId = crypto.randomUUID();
	await env.SMART_HOME_BUCKET.put(
		jobId,
		JSON.stringify({
			id: jobId,
			prompt: result.data,
			devices: devices,
			status: 'pending',
		}),
	);

	logEntry({
		timestamp: new Date().toISOString(),
		jobId,
		prompt: result.data,
		status: 'received',
	});

	res.status(202).json({
		jobId,
		streamUrl: `/agent/${jobId}/stream`,
	});
});

router.get('/:jobId/stream', async (req: Request<{ jobId: string }>, res): Promise<void> => {
	const { jobId } = req.params;
	const jobObject = await env.SMART_HOME_BUCKET.get(jobId);

	if (!jobObject) {
		res.status(404).json({ error: 'Job not found' });
		return;
	}

	const job = (await jobObject.json()) as AgentJob;

	setupSseHeaders(res);

	writeSse(res, 'connected', { jobId });
	writeSse(res, 'status', { status: 'started' });

	const heartbeat = setInterval(() => {
		res.write(`: ping\n\n`);
	}, 15000);

	const cleanup = (): void => {
		clearInterval(heartbeat);
		env.SMART_HOME_BUCKET.delete(job.id);
		if (!res.writableEnded) {
			res.end();
		}
	};

	req.on('close', cleanup);

	try {
		job.status = 'running';
		await env.SMART_HOME_BUCKET.put(jobId, JSON.stringify(job));

		const result = await loopAgent(job.prompt, job.devices, (event, data) => {
			writeSse(res, event, data);
		});

		job.status = 'completed';
		job.result = result.response;
		await env.SMART_HOME_BUCKET.put(jobId, JSON.stringify(job));

		logEntry({
			timestamp: new Date().toISOString(),
			jobId,
			prompt: job.prompt,
			status: 'completed',
		});

		cleanup();
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';

		job.status = 'failed';
		job.error = message;
		await env.SMART_HOME_BUCKET.put(jobId, JSON.stringify(job));

		logEntry({
			timestamp: new Date().toISOString(),
			jobId,
			prompt: job.prompt,
			status: 'failed',
			error: message,
		});

		writeSse(res, 'status', { status: 'failed' });
		writeSse(res, 'error', { message });

		cleanup();
	}
});

export default router;
