# TAX-PRIME user workflow

How practitioners are meant to use the platform from first login through publication.

## 1. Entry

| Action | Where |
|--------|--------|
| Read product scope | Landing `/` |
| Sign in (if enabled) | `/login` |
| Open workspace | `/demo/...` or `/research/...` |

**Simulation workspace (`demo`)** — seeded revenue + fictional cases + optimization.  
**Public research workspace (`research`)** — aggregate data only; no synthetic case scoring.

## 2. Standard analyst path

```
DATA HUB → EXPLORER → MODEL → PREDICT → SCENARIO → VALIDATION
         ↘ (optional COPILOT)
GOVERNANCE (submit) → REVIEWER approves → REPORTS
```

### Data foundation

1. **Data Integration Hub** — Treasury sync, optional FRED, or CSV/JSON import (`date,value`).
2. **Tax Data Explorer** — confirm series, sources, checksums.

### Modeling & prediction

3. **Risk Modeling Studio** — versioned features, exclusions, limitations.
4. **Predictive Intelligence** — forecast (≥12 months), save run.
5. **Scenario Simulation Lab** — shock/growth on latest forecast.

### Assessment (demo workspace only)

6. **Prioritization Engine** — fictional cases ranked by net score.
7. **Decision Optimization** — knapsack under staff-hour capacity.

### Learning & delivery

8. **Performance Validation** — 12-month holdout, compare methods.
9. **Groq AI Copilot** — optional narrative; **not** a source of truth.
10. **Governance and Audit** — analyst submits; reviewer approves.
11. **Reports & Publications** — brief from approved decision.

## 3. Roles (simulated)

| Role | Responsibility |
|------|----------------|
| **Analyst** | Ingest data, run models, submit briefs |
| **Reviewer** | Approve or request changes with rationale |
| **Administrator** | Same as analyst today; future: env/policy controls |

## 4. Persistence

| Layer | Purpose |
|-------|---------|
| Browser `localStorage` | Immediate UX per workspace |
| **Save to server** | JSON under `.data/workspaces/` on the host |

Use **Integration Test Lab** to probe APIs and run the E2E checklist.

## 5. What not to do

- Do not treat Groq output as official tax guidance.
- Do not import individual taxpayer data.
- Do not deploy without `TAX_PRIME_ACCESS_PASSWORD` on the public internet.

See also: [REALTIME-TESTING.md](./REALTIME-TESTING.md)