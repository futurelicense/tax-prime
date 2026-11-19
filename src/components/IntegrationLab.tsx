import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Chart } from '~/components/Chart'
import { Banner, Btn, Card, Tag } from '~/components/ui'
import { importObservations } from '~/components/ModuleView'
import { parseAggregateCsv } from '~/lib/import-validate'
import { apiFetch } from '~/lib/api-fetch'
import type { WorkspaceId } from '~/lib/types'
import { useWorkspace } from '~/hooks/useWorkspace'

type ProbeReport = {
  ranAt: string
  authRequired: boolean
  results: { id: string; name: string; status: string; ms: number; detail: string }[]
}

const STEPS = [
  { n: 1, title: 'Run integration probes', module: 'live-test' as const },
  { n: 2, title: 'Sync Treasury RCM', module: 'data-hub' as const },
  { n: 3, title: 'Import sample CSV (optional)', module: 'data-hub' as const },
  { n: 4, title: 'Inspect series', module: 'explorer' as const },
  { n: 5, title: 'Create forecast', module: 'predict' as const },
  { n: 6, title: 'Holdout validation', module: 'validation' as const },
  { n: 7, title: 'Groq explanation', module: 'copilot' as const },
]

export function IntegrationLab({ space }: { space: WorkspaceId }) {
  const { state, role, patch } = useWorkspace()
  const [report, setReport] = useState<ProbeReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(''), 3000)
  }

  const runProbes = async (deep: boolean) => {
    setBusy(true)
    try {
      const res = await apiFetch(`/api/integrations/probe?deep=${deep ? '1' : '0'}`)
      const data = (await res.json()) as ProbeReport & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Probe failed')
      setReport(data)
      notify(deep ? 'Deep probe complete' : 'Quick probe complete')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Probe error')
    } finally {
      setBusy(false)
    }
  }

  const loadSampleCsv = async () => {
    try {
      const res = await fetch('/samples/sample-revenue.csv')
      const text = await res.text()
      const rows = parseAggregateCsv(text)
      importObservations(rows, 'sample-revenue.csv', patch, role)
      notify(`Imported ${rows.length} sample months`)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Sample import failed')
    }
  }

  const statusVariant = (s: string) =>
    s === 'pass' ? 'ok' : s === 'fail' ? 'bad' : s === 'warn' ? 'warn' : 'warn'

  return (
    <>
      {toast ? (
        <div className="fixed bottom-5 right-5 bg-[#163c4b] text-white px-4 py-3 rounded-lg z-50">
          {toast}
        </div>
      ) : null}

      <Banner>
        Real-time integration testing — hit live Treasury/FRED endpoints from your dev server. Research
        workspace: <b>{space}</b> · {state.obs.length} observations loaded.
      </Banner>

      <Card title="Automated probes">
        <p className="text-sm text-[#64778a] mb-3">
          Quick probe checks Treasury reachability (~1 row). Deep probe runs full monthly aggregation
          (same as Data Hub sync).
        </p>
        <div className="flex flex-wrap gap-2">
          <Btn primary disabled={busy} onClick={() => void runProbes(false)}>
            Run quick probe
          </Btn>
          <Btn disabled={busy} onClick={() => void runProbes(true)}>
            Run deep probe (Treasury full sync test)
          </Btn>
        </div>
        {report ? (
          <div className="mt-4 overflow-auto">
            <p className="text-xs text-[#64778a] mb-2">Ran at {report.ranAt}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-[#607386]">
                  <th className="text-left p-2">Check</th>
                  <th>Status</th>
                  <th>ms</th>
                  <th className="text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((r) => (
                  <tr key={r.id} className="border-t border-[#edf0f4]">
                    <td className="p-2">{r.name}</td>
                    <td>
                      <Tag variant={statusVariant(r.status)}>{r.status}</Tag>
                    </td>
                    <td className="text-center">{r.ms}</td>
                    <td className="p-2 text-[#53677a] max-w-md">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card title="CSV ingestion test">
        <p className="text-sm text-[#64778a]">
          Schema: <code>date,value</code> (YYYY-MM). Validates duplicates and nonnegative values.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Btn primary onClick={() => void loadSampleCsv()}>
            Load bundled sample CSV
          </Btn>
          <a
            href="/samples/sample-revenue.csv"
            download
            className="inline-flex items-center px-3 py-2 border border-[#d5dfe8] rounded-md text-sm hover:bg-[#e8f4f2]"
          >
            Download sample file
          </a>
        </div>
        {state.obs.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm mb-2">Active series preview ({state.obs.length} months)</p>
            <Chart vals={state.obs.slice(-24).map((x) => x.value)} />
          </div>
        ) : null}
      </Card>

      <Card title="Manual E2E checklist">
        <ol className="space-y-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex items-start gap-3 text-sm">
              <span className="font-bold text-[#087f80]">{s.n}.</span>
              <div>
                <Link
                  to="/$space/$module"
                  params={{ space, module: s.module }}
                  className="text-[#087f80] font-medium hover:underline"
                >
                  {s.title}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  )
}