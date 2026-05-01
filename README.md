# Pixel Smart Home Agent

An AI-powered smart home simulator with a retro pixel art UI, built around natural language control and real-time agent feedback.

## Overview

Pixel Smart Home Agent lets users control simulated home devices such as lights, air conditioners, fans, TVs, and more using plain natural language.

For example, users can type:

- "It's cold right now"
- "Turn off all the lights"

The backend runs an agentic loop powered by an Anthropic-compatible model endpoint. It reads the current device state, decides which tools to call, executes actions, and streams real-time progress back to the frontend through Server-Sent Events (SSE).

This project was inspired by [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code).

## Features

- Natural language control for simulated smart home devices
- Agentic backend loop with tool calling
- Real-time streaming updates with Server-Sent Events
- Retro pixel art interface
- Cloudflare Worker backend
- Support for Anthropic-compatible model endpoints

## Demo Flow

A typical interaction looks like this:

1. The user enters a natural language command in the frontend
2. The backend creates a job and opens a streaming session
3. The agent reads current device state and selects tools to use
4. Tool results are fed back into the model in a loop
5. The frontend receives streamed events and updates the UI in real time

## Architecture

```text
User command (frontend)
  ↓
POST /api/agent
  → creates a job and stores it in Cloudflare R2
  ↓
GET /api/agent/:id/stream
  → opens SSE stream
  ↓
loopAgent() (max 10 iterations)
  ├── calls base AI model with system prompt + tool definitions
  ├── model returns tool calls: read_devices / adjust_device / read_weather
  ├── backend executes tools and updates in-memory device state
  └── feeds tool results back to the model until completion
  ↓
SSE events (connected → status → tool_use → done/error)
  ↓
Frontend Zustand store updates
  → UI reflects the latest device state
```

## Tech Stack

| Layer        | Technologies                                                                         |
| ------------ | ------------------------------------------------------------------------------------ |
| **Frontend** | React 19, TypeScript, TanStack Router, TanStack Query, Zustand, Tailwind CSS 4, Vite |
| **Backend**  | Cloudflare Workers, Express 5, TypeScript, Anthropic SDK, Zod, Wrangler              |
| **Storage**  | Cloudflare R2                                                                        |

## Project Structure

```text
smart-home-agent/
├── frontend/   # Retro pixel art UI built with React + Vite
└── backend/    # Cloudflare Worker API and agent loop
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare account
- Wrangler installed globally:

```bash
npm i -g wrangler
```

- An Anthropic API key, or a compatible proxy endpoint

## Installation

```bash
git clone https://github.com/LeeY0846/smart-home-agent.git
cd smart-home-agent

cd backend && npm install
cd ../frontend && npm install
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5050
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_BASE_URL=https://api.anthropic.com
MODEL_ID=claude-sonnet-4-6
```

Notes:

- `ANTHROPIC_BASE_URL` can be replaced with a compatible proxy URL
- `MODEL_ID` can be changed to whichever model you want to target

### Frontend

Create `frontend/.env.development`:

```env
VITE_BASE_URL=http://localhost:8787/api
```

## Running Locally

### 1. Start the backend

```bash
cd backend
npm run dev
```

Runs on:

```text
http://localhost:8787
```

### 2. Start the frontend

```bash
cd frontend
npm run dev
```

Runs on:

```text
http://localhost:3000
```

### 3. Open the app

Visit http://localhost:3000

## Deployment

The backend is deployed as a Cloudflare Worker.

### 1. Create the R2 bucket

```bash
wrangler r2 bucket create smart-home-bucket
```

### 2. Store the API key as a Wrangler secret

```bash
wrangler secret put ANTHROPIC_API_KEY
```

### 3. Deploy the backend

```bash
cd backend
npm run deploy
```

### 4. Configure the frontend for production

Update `frontend/.env.production` with your deployed Worker URL:

```env
VITE_BASE_URL=https://your-worker-url/api
```

### 5. Build the frontend

```bash
cd frontend
npm run build
```

The production build will be generated in:

```text
dist/
```

You can then deploy it to any static hosting provider.

## Why I Built This

This project explores how agentic workflows, tool calling, and streaming UI updates can be combined in a lightweight full-stack application. It was designed to be both a playful interface experiment and a practical implementation of an AI-driven control loop.

## License

MIT © 2026
