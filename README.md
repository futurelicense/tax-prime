# TAX-PRIME V2 (TanStack Start)

Production-oriented research workspace: **MODEL → PREDICT → ASSESS → DELIVER**, with server-side Treasury/FRED connectors, Groq copilot, and dual persistence (browser `localStorage` + `.data/workspaces` on the server).

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd /Users/7thgroup/Desktop/projects/tax-prime
cp .env.example .env
# Set TAX_PRIME_ACCESS_PASSWORD before any public deployment
# Optional: GROQ_API_KEY, FRED_API_KEY
npm install
npm run dev
```

## Security

When `TAX_PRIME_ACCESS_PASSWORD` is set:

- UI requires login at `/login` (httpOnly session cookie)
- All `/api/*` mutation and data routes require session or `Authorization: Bearer <password>`
- Leave unset only for local development

Check integration status: `GET /api/health`

Open [http://localhost:3000](http://localhost:3000) for the landing page. In the app, open **System Workflow** (`/demo/workflow`) or see [docs/USER-WORKFLOW.md](docs/USER-WORKFLOW.md).

## Environment

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Server-side Groq copilot (never sent to the browser) |
| `GROQ_MODEL` | Default `llama-3.3-70b-versatile` |
| `FRED_API_KEY` | Optional macro series sync |
| `FRED_SERIES` | Default `GDP` |
| `TREASURY_FROM_YEAR` | Calendar year filter for RCM aggregation (default `2018`) |

## Architecture

- **UI**: TanStack Router file routes under `src/routes/_workspace/$space.$module.tsx`
- **Domain logic**: `src/lib/*` (forecasting, workspace model, connectors)
- **API routes** (Nitro/TanStack Start server handlers):
  - `POST /api/connectors/treasury`
  - `POST /api/connectors/fred`
  - `POST /api/copilot`
  - `GET/PUT /api/workspace/:space`
- **Persistence**: `localStorage` per workspace + JSON files in `.data/workspaces/`

## Production build

```bash
npm run build
npm run start
npm test
```

Docker:

```bash
docker compose up --build
```

## Workspaces

- **demo** — synthetic cases + seeded revenue (simulation)
- **research** — aggregate-only public research mode

## Research boundary

Public aggregate data only. No operational tax decisions. Groq is advisory; numeric forecasts come from deterministic code in `src/lib/forecast.ts`.