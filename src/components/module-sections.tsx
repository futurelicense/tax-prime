import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Chart } from '~/components/Chart'
import { Btn, Card, Metric } from '~/components/ui'
import { importObservations } from '~/components/ModuleView'
import { parseAggregateCsv, parseAggregateJson } from '~/lib/import-validate'
import { caseScore, solveKnapsack } from '~/lib/forecast'
import { holdoutEvaluate } from '~/lib/evaluation'
import { money, num, uid, now } from '~/lib/format'
import type { Role, WorkspaceId, WorkspaceState } from '~/lib/types'
import { logAudit } from '~/hooks/useWorkspace'

type Ctx = {
  space: WorkspaceId
  role: Role
  state: WorkspaceState
  patch: (fn: (s: WorkspaceState) => void) => void
  latest: WorkspaceState['runs'][0] | undefined
  sc: WorkspaceState['scenarios'][0] | undefined
  opt: WorkspaceState['opt']
  notify: (t: string) => void
  busy: boolean
  setBusy: (b: boolean) => void
  syncTreasury: () => Promise<void>
  syncFred: () => Promise<void>
}

export function ModelSection({ state, role, patch, notify }: Pick<Ctx, 'state' | 'role' | 'patch' | 'notify'>) {
  const [name, setName] = useState(state.model.name)
  const [features, setFeatures] = useState(state.model.features)
  const [notes, setNotes] = useState(state.model.notes)
  return (
    <>
      <Card title={`Model specification · v${state.model.version}`}>
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Model name" value={name} onChange={setName} />
          <Field label="Features" value={features} onChange={setFeatures} />
          <Field label="Exclusions / limitations" value={notes} onChange={setNotes} />
        </div>
        <Btn
          primary
          className="mt-3"
          onClick={() => {
            if (!name.trim()) return notify('Model name required')
            patch((s) => {
              s.model = { name: name.trim(), version: s.model.version + 1, features, notes }
              logAudit(s, role, 'Model specification revised', 'v' + s.model.version)
            })
            notify('Model version saved')
          }}
        >
          Save new specification version
        </Btn>
      </Card>
      <Card title="Research risk taxonomy">
        <p className="text-sm text-[#64778a]">
          Receipt variance → aggregate deviation (not individual noncompliance). Revenue shock →
          hypothetical stress only.
        </p>
      </Card>
    </>
  )
}

export function ScenarioSection({
  state,
  role,
  patch,
  latest,
  notify,
}: Pick<Ctx, 'state' | 'role' | 'patch' | 'latest' | 'notify'>) {
  const [sname, setSname] = useState('Revenue downside')
  const [shock, setShock] = useState(-10)
  const [growth, setGrowth] = useState(2)
  const sc = state.scenarios[0]
  return (
    <>
      <Card title="Scenario assumptions">
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Scenario name" value={sname} onChange={setSname} />
          <Field label="Immediate shock (%)" value={String(shock)} onChange={(v) => setShock(Number(v))} />
          <Field label="Annual growth (%)" value={String(growth)} onChange={(v) => setGrowth(Number(v))} />
        </div>
        <p className="text-[#64778a] text-xs mt-2">Latest forecast: {latest?.id ?? 'None'}</p>
        <Btn
          primary
          className="mt-2"
          onClick={() => {
            if (!latest) return notify('Run a forecast first')
            const values = latest.values.map((x, i) =>
              x * (1 + shock / 100) * Math.pow(1 + growth / 100, i / 12),
            )
            patch((s) => {
              s.scenarios.unshift({
                id: uid(),
                name: sname || 'Scenario',
                run: latest.id,
                shock,
                growth,
                values,
                date: now(),
              })
              logAudit(s, role, 'Scenario saved', s.scenarios[0].id)
            })
          }}
        >
          Execute and save scenario
        </Btn>
      </Card>
      {sc ? (
        <Card title={`Latest scenario · ${sc.name}`}>
          <Chart vals={state.runs.find((r) => r.id === sc.run)?.values ?? []} other={sc.values} />
          <p className="mt-2">
            Scenario total: <b>{money(sc.values.reduce((a, b) => a + b, 0))}</b>
          </p>
        </Card>
      ) : null}
    </>
  )
}

export function GovernanceSection({ state, role, patch, latest, sc, notify }: Ctx) {
  const [rationale, setRationale] = useState('')
  const [reviews, setReviews] = useState<Record<number, string>>({})
  return (
    <>
      <Card title="Submit a decision brief">
        <p className="text-sm">
          Forecast: {latest?.id ?? 'None'} · Scenario: {sc?.id ?? 'None'}
        </p>
        <textarea
          className="w-full border border-[#d5dfe8] rounded-md p-2 min-h-20 mt-2"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Assumptions, alternatives, limitations"
        />
        <Btn
          primary
          className="mt-2"
          onClick={() => {
            if (!latest) return notify('Create a forecast first')
            if (!rationale.trim()) return notify('Enter rationale')
            patch((s) => {
              s.decisions.unshift({
                id: uid(),
                run: latest.id,
                scenario: sc?.id ?? null,
                status: 'Submitted',
                rationale: rationale.trim(),
                date: now(),
                review: '',
              })
              logAudit(s, role, 'Decision submitted', s.decisions[0].id)
            })
            setRationale('')
          }}
        >
          Submit for review
        </Btn>
      </Card>
      <Card title="Review queue">
        {state.decisions.length === 0 ? (
          <p className="text-[#64778a]">No decisions submitted.</p>
        ) : (
          state.decisions.map((d, i) => (
            <div key={d.id} className="border border-[#e0e6ed] rounded-lg p-3 my-2">
              <b>{d.id}</b> — {d.status}
              <p className="text-sm mt-1">{d.rationale}</p>
              {d.review ? <p className="text-sm">Review: {d.review}</p> : null}
              {role === 'Reviewer' && d.status === 'Submitted' ? (
                <>
                  <input
                    className="border border-[#d5dfe8] rounded-md px-2 py-1 w-full mt-2 text-sm"
                    placeholder="Review rationale"
                    value={reviews[i] ?? ''}
                    onChange={(e) => setReviews((r) => ({ ...r, [i]: e.target.value }))}
                  />
                  <div className="flex gap-2 mt-2">
                    <Btn
                      primary
                      onClick={() => {
                        const reason = reviews[i]?.trim()
                        if (!reason) return notify('Reviewer rationale required')
                        patch((s) => {
                          s.decisions[i].status = 'Approved'
                          s.decisions[i].review = reason
                          s.decisions[i].reviewed = now()
                          logAudit(s, role, 'Review Approved', d.id)
                        })
                      }}
                    >
                      Approve
                    </Btn>
                    <Btn
                      onClick={() => {
                        const reason = reviews[i]?.trim()
                        if (!reason) return notify('Reviewer rationale required')
                        patch((s) => {
                          s.decisions[i].status = 'Changes requested'
                          s.decisions[i].review = reason
                          s.decisions[i].reviewed = now()
                          logAudit(s, role, 'Review Changes', d.id)
                        })
                      }}
                    >
                      Request changes
                    </Btn>
                  </div>
                </>
              ) : null}
            </div>
          ))
        )}
      </Card>
      <Card title="Audit history">
        <SimpleTable
          head={['Timestamp', 'Actor', 'Event', 'Ref']}
          rows={state.audit.map((x) => [x.date, x.actor, x.action, x.detail])}
        />
      </Card>
    </>
  )
}

export function ReportsSection({ state, role, patch, space, notify }: Pick<Ctx, 'state' | 'role' | 'patch' | 'space' | 'notify'>) {
  const approved = state.decisions.find((d) => d.status === 'Approved')
  const make = () => {
    if (!approved) return notify('Requires approved decision')
    const run = state.runs.find((r) => r.id === approved.run)
    if (!run) return notify('Missing run')
    const scenario = state.scenarios.find((s) => s.id === approved.scenario)
    patch((s) => {
      s.reports.unshift({
        id: uid(),
        date: now(),
        decision: approved.id,
        run: run.id,
        scenario: scenario?.id ?? null,
        mode: space,
        method: run.method,
        total: run.values.reduce((a, b) => a + b, 0),
        source: run.source,
        rationale: approved.rationale,
        review: approved.review,
      })
      logAudit(s, role, 'Report generated', s.reports[0].id)
    })
    notify('Brief generated')
  }
  return (
    <>
      <Card title="Research publication center">
        <Btn primary onClick={make}>
          Generate approved brief
        </Btn>
      </Card>
      <Card title="Saved reports">
        {state.reports.map((r) => (
          <pre key={r.id} className="text-xs whitespace-pre-wrap border border-[#e0e6ed] p-3 rounded-lg my-2">
            {reportText(r)}
          </pre>
        ))}
      </Card>
    </>
  )
}

export function ValidationSection({ state, role, patch, notify }: Pick<Ctx, 'state' | 'role' | 'patch' | 'notify'>) {
  const ev = state.evaluations[0]
  return (
    <>
      <Card title="Chronological holdout validation">
        <Btn
          primary
          onClick={() => {
            try {
              const r = holdoutEvaluate(state.obs)
              patch((s) => {
                s.evaluations.unshift({
                  id: uid(),
                  date: now(),
                  ...r,
                })
                logAudit(s, role, 'Holdout evaluation saved', s.evaluations[0].id)
              })
              notify('Evaluation saved')
            } catch (e) {
              notify(e instanceof Error ? e.message : 'Evaluation failed')
            }
          }}
        >
          Run backtest
        </Btn>
      </Card>
      {ev ? (
        <Card title="Latest evaluation">
          <p className="text-sm">Cutoff: {ev.cutoff}</p>
          <SimpleTable
            head={['Method', 'MAE', 'RMSE', 'sMAPE']}
            rows={[
              ['Seasonal naïve', money(ev.baseline.mae), money(ev.baseline.rmse), num(ev.baseline.smape) + '%'],
              ['Moving average', money(ev.alternate.mae), money(ev.alternate.rmse), num(ev.alternate.smape) + '%'],
            ]}
          />
          <Chart vals={ev.actual} other={ev.prediction} />
        </Card>
      ) : null}
    </>
  )
}

export function DataHubExtra({
  state,
  role,
  patch,
  busy,
  notify,
}: Pick<Ctx, 'state' | 'role' | 'patch' | 'busy'> & { notify: (t: string) => void }) {
  const onFile = async (file: File) => {
    try {
      const txt = await file.text()
      const rows = file.name.endsWith('.json') ? parseAggregateJson(txt) : parseAggregateCsv(txt)
      if (!confirm('Confirm aggregate-only data with no taxpayer PII?')) return
      importObservations(rows, file.name, patch, role)
      notify(`Imported ${rows.length} observations from ${file.name}`)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Import failed')
    }
  }
  return (
    <Card title="Import monthly aggregate data">
      <p className="text-xs text-[#64778a] mb-2">
        CSV header: <code>date,value</code> (YYYY-MM). Or use{' '}
        <a href="/samples/sample-revenue.csv" className="text-[#087f80]">
          sample-revenue.csv
        </a>
        .
      </p>
      <input
        type="file"
        accept=".csv,.json"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void onFile(f)
        }}
      />
      {state.macro?.series ? (
        <p className="text-sm mt-2">
          Macro: <b>{state.macro.series}</b> ({state.macro.points.length} points)
        </p>
      ) : null}
    </Card>
  )
}

export function PrioritizeFull({ space, state, role, patch, notify }: Pick<Ctx, 'space' | 'state' | 'role' | 'patch' | 'notify'>) {
  if (space !== 'demo') {
    return <Card title="Aggregate-only mode">Synthetic case scoring is disabled in research workspace.</Card>
  }
  const [p, setP] = useState(50)
  const [value, setValue] = useState(15000)
  const [cost, setCost] = useState(600)
  const [hours, setHours] = useState(4)
  const [burden, setBurden] = useState(2)
  const ranked = [...state.cases].sort((a, b) => caseScore(b) - caseScore(a))
  return (
    <>
      <Card title="Add fictional intervention candidate">
        <div className="grid md:grid-cols-5 gap-2">
          <Field label="Probability %" value={String(p)} onChange={(v) => setP(Number(v))} />
          <Field label="Value $" value={String(value)} onChange={(v) => setValue(Number(v))} />
          <Field label="Cost $" value={String(cost)} onChange={(v) => setCost(Number(v))} />
          <Field label="Hours" value={String(hours)} onChange={(v) => setHours(Number(v))} />
          <Field label="Burden" value={String(burden)} onChange={(v) => setBurden(Number(v))} />
        </div>
        <Btn
          primary
          className="mt-2"
          onClick={() => {
            patch((s) => {
              s.cases.push({
                id: 'SIM-' + uid(),
                p: p / 100,
                value,
                cost,
                hours,
                burden,
              })
              s.opt = null
              logAudit(s, role, 'Synthetic case added', '')
            })
          }}
        >
          Add case
        </Btn>
      </Card>
      <Card title="Ranked opportunities">
        <SimpleTable
          head={['Case', 'Prob', 'Net score']}
          rows={ranked.map((c) => [c.id, num(c.p * 100) + '%', money(caseScore(c))])}
        />
        <Link to="/$space/$module" params={{ space, module: 'optimize' }} className="text-[#087f80] text-sm">
          Optimize capacity →
        </Link>
      </Card>
    </>
  )
}

export function OptimizeFull({ space, state, role, patch, opt, notify }: Pick<Ctx, 'space' | 'state' | 'role' | 'patch' | 'opt' | 'notify'>) {
  if (space !== 'demo') {
    return <Card title="Simulation only">Switch to demo workspace.</Card>
  }
  const [capacity, setCapacity] = useState(opt?.capacity ?? 60)
  const [penalty, setPenalty] = useState(opt?.lambda ?? 100)
  return (
    <Card title="Capacity constrained optimization">
      <TableFields capacity={capacity} penalty={penalty} setCapacity={setCapacity} setPenalty={setPenalty} />
      <Btn
        primary
        className="mt-2"
        onClick={() => {
          if (!Number.isInteger(capacity) || capacity < 0) return notify('Invalid capacity')
          const best = solveKnapsack(state.cases, capacity, penalty)
          patch((s) => {
            s.opt = {
              id: uid(),
              capacity,
              lambda: penalty,
              ids: best.ids,
              value: best.v,
              hours: s.cases.filter((c) => best.ids.includes(c.id)).reduce((a, c) => a + c.hours, 0),
              date: now(),
            }
            logAudit(s, role, 'Synthetic optimization', s.opt.id)
          })
        }}
      >
        Solve allocation
      </Btn>
      {opt ? (
        <form className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <Metric label="Selected" value={opt.ids.length} />
          <Metric label="Hours" value={`${opt.hours} / ${opt.capacity}`} />
          <Metric label="Net value" value={money(opt.value)} />
          <Metric label="Unused" value={opt.capacity - opt.hours} />
        </form>
      ) : null}
    </Card>
  )
}

function TableFields({
  capacity,
  penalty,
  setCapacity,
  setPenalty,
}: {
  capacity: number
  penalty: number
  setCapacity: (n: number) => void
  setPenalty: (n: number) => void
}) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Field label="Staff hours" value={String(capacity)} onChange={(v) => setCapacity(Number(v))} />
      <Field label="Burden penalty" value={String(penalty)} onChange={(v) => setPenalty(Number(v))} />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-[#53677a]">
      {label}
      <input
        className="border border-[#d5dfe8] rounded-md px-2 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function SimpleTable({ head, rows }: { head: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-auto mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase text-[#607386]">
            {head.map((h) => (
              <th key={h} className="text-left p-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#edf0f4]">
              {r.map((c, j) => (
                <td key={j} className="p-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function reportText(r: {
  date: string
  mode: string
  decision: string
  run: string
  scenario: string | null
  method: string
  total: number
  source: string[]
  rationale: string
  review: string
}) {
  return `TAX-PRIME V2 | Research decision brief
Generated: ${r.date}
Mode: ${r.mode}
Decision: ${r.decision}
Forecast: ${r.run}
Scenario: ${r.scenario ?? 'None'}
Method: ${r.method}
Modeled total: ${money(r.total)}
Sources: ${r.source.join(', ')}
Rationale: ${r.rationale}
Review: ${r.review}
Research only. No operational tax decision.`
}