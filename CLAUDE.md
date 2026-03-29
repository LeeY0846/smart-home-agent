# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Home Agent is a full-stack app where a React frontend communicates with an Express backend that uses Claude (via Anthropic SDK) to control smart home devices through an agentic tool-use loop.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Watch mode with tsx (port 5050)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server (port 3000)
npm run build    # Production build
npm run test     # Vitest
npm run lint     # ESLint
npm run check    # Auto-fix Prettier + ESLint
```

### Testing the backend API manually
```bash
curl -X POST http://localhost:5050/test-loop \
  -H "Content-Type: application/json" \
  -d '{"command":"Turn on the kitchen light"}'
```
The `backend/test.http` file has REST client snippets for all endpoints.

## Architecture

### Data Flow
```
User command → POST /test-loop → loopAgent() → Claude + tools → DeviceManager → response
```

### Backend (`/backend/src`)
- **`app.ts`** — Express server with routes: `GET /`, `GET /test-stream`, `POST /test-send`, `POST /test-loop`
- **`client.ts`** — Anthropic SDK init + `loopAgent()`: agentic loop (max 10 iterations) that sends messages to Claude, executes tool calls, feeds results back, and repeats until `stop_reason !== "tool_use"`
- **`tools.ts`** — Tool definitions for Claude: `read_weather`, `read_devices`, `adjust_device`, `read_time`
- **`libs/deviceManager.ts`** — In-memory device state (lights, ACs) with Zod validation; state resets on restart
- **`prompts/system.ts`** — System prompt restricting Claude strictly to smart home device control

### Frontend (`/frontend/src`)
- **Routing** — TanStack Router with file-based routes under `routes/`; `routeTree.gen.ts` is auto-generated — do not edit manually
- **Path alias** — `#/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`)
- **State** — Zustand for global state; TanStack Query for server state
- The frontend is not yet integrated with the backend API — it's currently a TanStack Start template.

### Configuration
- Backend port and Claude model are set via `/backend/.env` (`PORT`, `MODEL_ID`, `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`)
- The backend can target either the real Anthropic API or a compatible proxy (currently configured for MiniMax via `ANTHROPIC_BASE_URL`)
