import fs from "fs";
import path from "path";

const LOG_DIR = process.env.LOG_DIR ?? path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "messages.jsonl");

export type LogEntry = {
  timestamp: string;
  jobId: string;
  prompt: string;
  status: "received" | "completed" | "failed";
  error?: string;
};

fs.mkdirSync(LOG_DIR, { recursive: true });

export function logEntry(entry: LogEntry): void {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");
}

export function readLogs(limit = 100): LogEntry[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, "utf-8").trim().split("\n").filter(Boolean);
  return lines.slice(-limit).map((l) => JSON.parse(l) as LogEntry);
}
