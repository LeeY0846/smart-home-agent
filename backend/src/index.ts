import { env } from 'cloudflare:workers';
import express from 'express';
import cors from 'cors';
import { httpServerHandler } from 'cloudflare:node';
import agentRouter from './routes/agent.js';

const app = express();
const port = Number(env.PORT) || 5050;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/api', (req, res) => {
	res.json({ message: 'Connected' });
});

app.use('/api/agent', agentRouter);

app.listen(port);

export default httpServerHandler({ port });
