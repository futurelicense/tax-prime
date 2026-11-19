# TAX-PRIME real-time testing guide

Run with the dev server up: `npm run dev` → http://localhost:3000

## Environment

```bash
cp .env.example .env
# Optional for full probe matrix:
# FRED_API_KEY=...
# GROQ_API_KEY=...
# TAX_PRIME_ACCESS_PASSWORD=...  # enables login + protects APIs
```

## CLI smoke test

```bash
npm run test:live
# or against another host:
# TAX_PRIME_URL=https://your-host TAX_PRIME_ACCESS_PASSWORD=secret npm run test:live
```

## UI: Integration Test Lab

1. Open **http://localhost:3000/demo/live-test** (or research workspace).
2. **Run quick probe** — Treasury API reachability.
3. **Run deep probe** — full RCM monthly aggregation (same logic as Data Hub sync).
4. **Load bundled sample CSV** — 24 months into the workspace.
5. Follow the **manual E2E checklist** links.

## End-to-end flow (research workspace)

| Step | Module | What to verify |
|------|--------|----------------|
| 1 | Integration Test Lab | Probes pass; Treasury deep shows month count |
| 2 | Data Integration Hub | **Sync now** (Treasury) · optional FRED · snapshot checksum |
| 3 | Data Integration Hub | Upload `public/samples/sample-revenue.csv` |
| 4 | Tax Data Explorer | Table + chart match import |
| 5 | Predictive Intelligence | Forecast ≥12 obs · run saved |
| 6 | Scenario Simulation Lab | Stress vs baseline chart |
| 7 | Performance Validation | Holdout MAE/RMSE |
| 8 | Groq AI Copilot | Question about latest run (needs `GROQ_API_KEY`) |
| 9 | Governance | Submit → switch role **Reviewer** → Approve |
| 10 | Reports | Generate brief |

## API reference (authenticated when password set)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Config flags |
| GET | `/api/integrations/probe` | Quick probes |
| GET | `/api/integrations/probe?deep=1` | + full Treasury aggregation |
| POST | `/api/connectors/treasury` | Load monthly series JSON |
| POST | `/api/connectors/fred` | Macro series (needs key) |
| POST | `/api/copilot` | Groq explanation |
| GET/PUT | `/api/workspace/:space` | Server JSON store |

## CSV rules

- Header: `date,value`
- Dates: `YYYY-MM`, unique, nonnegative USD aggregates
- JSON alternative: `[{"date":"2024-01","value":1.0e11}, ...]`

## Demo vs research

- **demo** — synthetic cases, optimization, seeded revenue
- **research** — aggregate-only; no synthetic case scoring