import "dotenv/config";
import express from "express";
import type { ContentBlock } from "@anthropic-ai/sdk/resources";
import { sendMessage, streamMessage } from "./client.js";

const app = express();
const port = Number(process.env.PORT) || 5050;

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
    responses: message.content
      .filter((c) => c.type == "text")
      .map((c) => c.text),
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
