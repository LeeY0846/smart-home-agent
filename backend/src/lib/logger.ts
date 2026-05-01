export type LogEntry = {
	timestamp: string;
	jobId: string;
	prompt: string;
	status: 'received' | 'completed' | 'failed';
	error?: string;
};

export function logEntry(entry: LogEntry): void {
	console.log(JSON.stringify(entry));
}
