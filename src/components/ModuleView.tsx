import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Chart } from '~/components/Chart'
import { Banner, Btn, Card, Metric, Tag } from '~/components/ui'
import { forecast, type ForecastMethod } from '~/lib/forecast'
import { digest, money, uid, now } from '~/lib/format'
import { newSnapshotId } from '~/lib/workspace'
import { moduleBySlug, type ModuleSlug } from '~/lib/modules'
import type { WorkspaceState } from '~/lib/types'
import { logAudit, useWorkspace } from '~/hooks/useWorkspace'
import { apiFetch } from '~/lib/api-fetch'
import { IntegrationLab } from '~/components/IntegrationLab'
import { WorkflowOutline } from '~/components/WorkflowOutline'
import {
  DataHubExtra,
  GovernanceSection,
  ModelSection,
  OptimizeFull,
  PrioritizeFull,
  ReportsSection,
  ScenarioSection,
  ValidationSection,
} from '~/components/module-sections'

const SOURCES = [
  ['Treasury Revenue Collections', 'treasury-rcm', true],
  ['FRED / ALFRED', 'fred', true],
  ['IRS SOI / Data Book', 'irs-soi', false],
] as const

export function ModuleView({ module }: { module: ModuleSlug }) {
  const { space, role, state, patch, reset, pushToServer, syncFromServer } = useWorkspace()
  const meta = moduleBySlug(module)
  const latest = state.runs[0]
  const sc = state.scenarios[0]
  const opt = state.opt
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  const notify = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(''), 2600)
  }

  const total = useMemo(
    () => state.obs.reduce((a, b) => a + b.value, 0),
    [state.obs],
  )

  const runForecast = (method: ForecastMethod, horizon: number) => {
    try {
      const f = forecast(state.obs, method, horizon)
      const errors = state.obs.slice(12).map((o, i) => o.value - state.obs[i].value)
      const sigma = Math.sqrt(
        errors.reduce((a, b) => a + b * b, 0) / Math.max(1, errors.length),
      )
      patch((s) => {
        s.runs.unshift({
          id: uid(),
          date: now(),
          method,
          h: horizon,
          values: f,
          low: f.map((x) => Math.max(0, x - 1.96 * sigma)),
          high: f.map((x) => x + 1.96 * sigma),
          source: s.source.map((x) => x.id),
          version: s.model.version,
        })
        logAudit(s, role, 'Forecast created', s.runs[0].id)
      })
      notify('Versioned forecast saved')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Forecast failed')
    }
  }

  const syncTreasury = async () => {
    setBusy(true)
    try {
      const res = await apiFetch('/api/connectors/treasury', { method: 'POST' })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        months?: { date: string; value: number }[]
        checksum?: string
      }
      if (!res.ok) throw new Error(data.error || 'Sync failed')
      const sid = newSnapshotId('TRS')
      patch((s) => {
        const months = data.months!
        s.source.push({
          id: sid,
          name: 'Treasury RCM (API aggregate)',
          date: now(),
          count: months.length,
          checksum: data.checksum,
          connector: 'treasury-rcm',
        })
        s.obs = months.map((r) => ({ ...r, source: sid }))
        s.connectors['treasury-rcm'] = {
          status: 'Connected',
          lastSync: now(),
          rows: months.length,
          checksum: data.checksum,
        }
        logAudit(s, role, 'Treasury RCM sync', sid)
      })
      notify(`Treasury sync: ${data.months?.length} months`)
      await pushToServer()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Treasury error')
    } finally {
      setBusy(false)
    }
  }

  const syncFred = async () => {
    setBusy(true)
    try {
      const res = await apiFetch('/api/connectors/fred', { method: 'POST' })
      const data = (await res.json()) as {
        error?: string
        series?: string
        points?: { date: string; value: number }[]
        checksum?: string
      }
      if (!res.ok) throw new Error(data.error || 'FRED sync failed')
      patch((s) => {
        s.macro = { series: data.series!, points: data.points!, date: now() }
        s.connectors.fred = {
          status: 'Connected',
          lastSync: now(),
          rows: data.points?.length,
          checksum: data.checksum,
        }
        logAudit(s, role, 'FRED macro sync', data.series!)
      })
      notify(`FRED: ${data.points?.length} points`)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'FRED error')
    } finally {
      setBusy(false)
    }
  }

  const [question, setQuestion] = useState('')
  const askCopilot = async () => {
    if (!question.trim()) return
    setBusy(true)
    try {
      const res = await apiFetch('/api/copilot', {
        method: 'POST',
        body: JSON.stringify({
          question: question.trim(),
          context: {
            mode: space,
            observations: state.obs.length,
            latestRun: latest,
            latestScenario: sc,
            optimization: opt,
            model: state.model,
            sources: state.source.slice(0, 8),
            macro: state.macro,
          },
        }),
      })
      const data = (await res.json()) as {
        answer?: string
        engine?: string
        error?: string
      }
      if (!res.ok) throw new Error(data.error || 'Copilot failed')
      patch((s) => {
        s.chat.unshift({
          q: question.trim(),
          a: data.answer!,
          date: now(),
          engine: data.engine,
        })
        logAudit(s, role, 'Copilot', data.engine || 'server')
      })
      setQuestion('')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Copilot error')
    } finally {
      setBusy(false)
    }
  }

  const sectionCtx = {
    space,
    role,
    state,
    patch,
    latest,
    sc,
    opt,
    notify,
    busy,
    setBusy,
    syncTreasury,
    syncFred,
  }

  let body: React.ReactNode = null

  if (module === 'workflow') {
    body = <WorkflowOutline space={space} />
  }

  if (module === 'dashboard') {
    body = (
      <>
        <Card title="System workflow">
          <WorkflowOutline space={space} compact />
          <div className="mt-3">
            <Link to="/$space/$module" params={{ space, module: 'workflow' }} className="text-[#087f80] text-sm font-medium">
              View full workflow guide →
            </Link>
          </div>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          <Metric label="Aggregate receipts" value={money(total)} note="Active series total" />
          <Metric label="Observations" value={state.obs.length} note="Monthly records" />
          <Metric label="Forecast runs" value={state.runs.length} note="Saved versions" />
          <Metric
            label="Live connectors"
            value={Object.values(state.connectors).filter((c) => c.status === 'Connected').length}
            note="Server-backed APIs"
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Revenue intelligence">
            <Chart vals={state.obs.map((x) => x.value)} />
            <Link to="/$space/$module" params={{ space, module: 'predict' }} className="text-[#087f80]">
              Open forecasting →
            </Link>
          </Card>
          <Card title="Operational workflow">
            <p>Evidence snapshots: <b>{state.source.length}</b></p>
            <p>Scenarios saved: <b>{state.scenarios.length}</b></p>
            <p>Synthetic cases: <b>{state.cases.length}</b></p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                to="/$space/$module"
                params={{ space, module: 'live-test' }}
                className="text-sm text-[#087f80] self-center mr-2"
              >
                Integration Test Lab →
              </Link>
              <Btn onClick={() => void pushToServer()} primary>
                Save to server
              </Btn>
              <Btn onClick={() => void syncFromServer()}>Load from server</Btn>
              <Btn onClick={reset}>Reset workspace</Btn>
            </div>
          </Card>
        </div>
      </>
    )
  }

  if (module === 'live-test') {
    body = <IntegrationLab space={space} />
  }

  if (module === 'data-hub') {
    body = (
      <>
        <Card title="Source registry (production)">
          <p className="text-[#64778a] mb-3">
            Treasury and FRED sync run on the TanStack Start server. Set keys in <code>.env</code>.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#607386] text-xs uppercase">
                <th className="py-2">Source</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map(([name, id, live]) => {
                const c = state.connectors[id]
                return (
                  <tr key={id} className="border-t border-[#edf0f4]">
                    <td className="py-2">{name}</td>
                    <td>
                      {c?.status === 'Connected' ? (
                        <Tag>Connected</Tag>
                      ) : c?.status === 'Error' ? (
                        <Tag variant="bad">Error</Tag>
                      ) : (
                        <Tag variant="warn">Not connected</Tag>
                      )}
                    </td>
                    <td>
                      {live ? (
                        <Btn
                          primary
                          disabled={busy}
                          onClick={id === 'treasury-rcm' ? syncTreasury : syncFred}
                        >
                          Sync now
                        </Btn>
                      ) : (
                        <span className="text-[#64778a]">File import (client)</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
        <Card title="Snapshot catalog">
          <div className="overflow-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-xs uppercase text-[#607386] bg-[#f7f9fb]">
                  <th className="p-2">ID</th>
                  <th>Name</th>
                  <th>Rows</th>
                  <th>Checksum</th>
                </tr>
              </thead>
              <tbody>
                {state.source.map((x) => (
                  <tr key={x.id} className="border-t border-[#edf0f4]">
                    <td className="p-2">{x.id}</td>
                    <td>{x.name}</td>
                    <td>{x.count}</td>
                    <td>{x.checksum ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <DataHubExtra {...sectionCtx} notify={notify} />
      </>
    )
  }

  if (module === 'explorer') {
    body = (
      <Card title="Aggregate observation explorer">
        <Chart vals={state.obs.map((x) => x.value)} />
        <div className="overflow-auto mt-4 max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-[#607386]">
                <th className="text-left p-2">Month</th>
                <th>Receipts</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {state.obs.map((x) => (
                <tr key={x.date} className="border-t border-[#edf0f4]">
                  <td className="p-2">{x.date}</td>
                  <td>{money(x.value)}</td>
                  <td>{x.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  if (module === 'predict') {
    body = (
      <>
        <Card title="Configure forecast">
          <ForecastForm onRun={runForecast} obsCount={state.obs.length} />
        </Card>
        {latest ? (
          <Card title={`Latest forecast · ${latest.id}`}>
            <Chart vals={latest.values} other={latest.high} />
            <p className="text-xs text-[#64778a] mt-2">
              Horizon total: {money(latest.values.reduce((a, b) => a + b, 0))}
            </p>
          </Card>
        ) : null}
        <Card title="Run history">
          <SimpleRunsTable runs={state.runs} />
        </Card>
      </>
    )
  }

  if (module === 'model') body = <ModelSection state={state} role={role} patch={patch} notify={notify} />

  if (module === 'scenario') {
    body = <ScenarioSection state={state} role={role} patch={patch} latest={latest} notify={notify} />
  }

  if (module === 'governance') {
    body = <GovernanceSection {...sectionCtx} />
  }

  if (module === 'reports') {
    body = <ReportsSection space={space} state={state} role={role} patch={patch} notify={notify} />
  }

  if (module === 'validation') {
    body = <ValidationSection state={state} role={role} patch={patch} notify={notify} />
  }

  if (module === 'copilot') {
    body = (
      <Card title="Groq AI Copilot">
        <Banner>
          Server-side Groq with workspace JSON context. Keys from <code>GROQ_API_KEY</code> only.
        </Banner>
        {state.chat.map((x, i) => (
          <div key={i} className="border border-[#e0e6ed] rounded-lg p-3 my-2">
            <b>{x.q}</b>
            <p className="mt-1 whitespace-pre-wrap">{x.a}</p>
            <small className="text-[#64778a]">
              {x.date} · {x.engine}
            </small>
          </div>
        ))}
        <textarea
          className="w-full border border-[#d5dfe8] rounded-md p-2 min-h-24 mt-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Explain the latest forecast and limitations"
        />
        <div className="mt-2">
          <Btn primary disabled={busy} onClick={() => void askCopilot()}>
            Generate explanation
          </Btn>
        </div>
      </Card>
    )
  }

  if (module === 'prioritize') {
    body = <PrioritizeFull space={space} state={state} role={role} patch={patch} notify={notify} />
  }

  if (module === 'optimize') {
    body = <OptimizeFull {...sectionCtx} />
  }

  if (!body) {
    body = (
      <Card title={meta.name}>
        <p className="text-[#64778a]">
          Module scaffold ready — extend in <code>src/components/ModuleView.tsx</code>.
        </p>
      </Card>
    )
  }

  return (
    <>
      {toast ? (
        <div className="fixed bottom-5 right-5 bg-[#163c4b] text-white px-4 py-3 rounded-lg z-50">
          {toast}
        </div>
      ) : null}
      <Banner>
        {space === 'demo'
          ? 'SIMULATION · fictional tax cases and synthetic revenue'
          : 'PUBLIC RESEARCH · aggregate data only'}{' '}
        · TanStack Start production build
      </Banner>
      <h1 className="text-3xl tracking-tight my-2">{meta.name}</h1>
      <p className="text-[#64778a] mb-4">{meta.intro}</p>
      {body}
      <p className="text-[11px] text-[#667c8c] mt-8">
        TAX-PRIME V2.0 · localStorage + server workspace store · Research only
      </p>
    </>
  )
}

function ForecastForm({
  onRun,
  obsCount,
}: {
  onRun: (m: ForecastMethod, h: number) => void
  obsCount: number
}) {
  const [method, setMethod] = useState<ForecastMethod>('Seasonal naïve')
  const [horizon, setHorizon] = useState(12)
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <label className="grid gap-1 text-xs text-[#53677a]">
        Method
        <select
          className="border border-[#d5dfe8] rounded-md px-2 py-2"
          value={method}
          onChange={(e) => setMethod(e.target.value as ForecastMethod)}
        >
          <option>Seasonal naïve</option>
          <option>Moving average</option>
          <option>Last observation</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-[#53677a]">
        Horizon
        <input
          type="number"
          min={1}
          max={24}
          className="border border-[#d5dfe8] rounded-md px-2 py-2 w-24"
          value={horizon}
          onChange={(e) => setHorizon(Number(e.target.value))}
        />
      </label>
      <span className="text-[#64778a] text-xs pb-2">Observations: {obsCount}</span>
      <Btn primary onClick={() => onRun(method, horizon)}>
        Run forecast
      </Btn>
    </div>
  )
}

function SimpleRunsTable({ runs }: { runs: WorkspaceState['runs'] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase text-[#607386]">
          <th className="text-left p-2">Run</th>
          <th>Method</th>
          <th>Horizon</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((x) => (
          <tr key={x.id} className="border-t border-[#edf0f4]">
            <td className="p-2">{x.id}</td>
            <td>{x.method}</td>
            <td>{x.h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function importObservations(
  rows: { date: string; value: number }[],
  fileName: string,
  patch: ReturnType<typeof useWorkspace>['patch'],
  role: string,
) {
  const sid = uid()
  const raw = JSON.stringify(rows)
  patch((s) => {
    s.source.push({
      id: sid,
      name: fileName,
      date: now(),
      count: rows.length,
      checksum: digest(raw),
    })
    s.obs = rows
      .map((r) => ({ date: r.date, value: Number(r.value), source: sid }))
      .sort((a, b) => a.date.localeCompare(b.date))
    logAudit(s, role, 'Aggregate file imported', sid)
  })
}