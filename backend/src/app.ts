import "dotenv/config";
import express, { type RequestHandler } from "express";
import type { ContentBlock } from "@anthropic-ai/sdk/resources";
import { loopAgent, sendMessage, streamMessage } from "./client.js";
import { type Response, type Request } from "express";
import type { AgentJob, AgentSseEventMap } from "./types.js";
import z, { safeParse } from "zod";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT) || 5050;

const jobs = new Map<string, AgentJob>();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Connected" });
});

app.get("/test-stream", async (_req, res) => {
  const stream = streamMessage([{ content: "Who are you", role: "user" }]).on(
    "thinking",
    (text) => {
      console.log(text);
    },
  );

  const message = await stream.finalMessage();

  res.json({
    responses: message.content,
    tokenUsage: message.usage,
  });
});

app.post("/test-send", async (req, res) => {
  const { command } = req.body;

  const message = await sendMessage([{ content: command, role: "user" }]);
  res.json({
    responses: message.content,
    tokenUsage: message.usage,
  });
});

app.post("/test-loop", async (req, res) => {
  const { command } = req.body;

  const message = await loopAgent(command);

  res.json({
    responses: message.response,
  });
});

function setupSseHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

function writeSse<K extends keyof AgentSseEventMap>(
  res: Response,
  event: K,
  data: AgentSseEventMap[K],
) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

app.post("/agent", (req: Request<{ message?: string }>, res) => {
  const { message } = req.body;
  const result = z.string().safeParse(message);
  if (!result.success) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const jobId = crypto.randomUUID();
  jobs.set(jobId, {
    id: jobId,
    prompt: result.data,
    status: "pending",
  });

  res.status(202).json({
    jobId,
    streamUrl: `/agent/${jobId}/stream`,
  });
});

app.get(
  "/agent/:jobId/stream",
  async (req: Request<{ jobId: string }>, res): Promise<void> => {
    console.log(req);
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    setupSseHeaders(res);

    writeSse(res, "connected", { jobId });
    writeSse(res, "status", { status: "started" });

    const heartbeat = setInterval(() => {
      res.write(`: ping\n\n`);
    }, 15000);

    const cleanup = (): void => {
      clearInterval(heartbeat);
      if (!res.writableEnded) {
        res.end();
      }
    };

    req.on("close", cleanup);

    try {
      job.status = "running";
      jobs.set(jobId, job);

      const result = await loopAgent(job.prompt, (event, data) => {
        writeSse(res, event, data);
      });

      job.status = "completed";
      job.result = result.response;
      jobs.set(jobId, job);

      cleanup();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      job.status = "failed";
      job.error = message;
      jobs.set(jobId, job);

      writeSse(res, "status", { status: "failed" });
      writeSse(res, "error", { message });

      cleanup();
    }
  },
);

app.get("/stream-test", async (req, res) => {
  setupSseHeaders(res);

  writeSse(res, "connected", { jobId: "12345" });

  req.on("close", () => {
    console.log("Channel closed");
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
