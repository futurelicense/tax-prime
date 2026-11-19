import { fetchFredSeries } from '~/lib/connectors/fred'
import { fetchTreasuryMonthly } from '~/lib/connectors/treasury'
import { serverEnv } from '~/server/env'
import { authRequired } from '~/server/auth'

const FISCAL = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service'

export type ProbeResult = {
  id: string
  name: string
  status: 'pass' | 'fail' | 'skip' | 'warn'
  ms: number
  detail: string
}

async function timed(name: string, id: string, fn: () => Promise<string>): Promise<ProbeResult> {
  const start = Date.now()
  try {
    const detail = await fn()
    return { id, name, status: 'pass', ms: Date.now() - start, detail }
  } catch (e) {
    return {
      id,
      name,
      status: 'fail',
      ms: Date.now() - start,
      detail: e instanceof Error ? e.message : 'Unknown error',
    }
  }
}

export async function runIntegrationProbes(deep = false): Promise<{
  ranAt: string
  authRequired: boolean
  config: ReturnType<typeof serverEnv> & { groq: boolean; fred: boolean }
  results: ProbeResult[]
}> {
  const env = serverEnv()
  const results: ProbeResult[] = []

  results.push(
    await timed('Platform health', 'health', async () => 'Application server responding'),
  )

  results.push(
    await timed('Treasury API reachability', 'treasury-reach', async () => {
      const u = `${FISCAL}/v2/revenue/rcm?page[size]=1`
      const r = await fetch(u)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = (await r.json()) as { data?: unknown[] }
      return `OK · sample rows: ${j.data?.length ?? 0}`
    }),
  )

  if (deep) {
    results.push(
      await timed('Treasury RCM aggregate sync', 'treasury-full', async () => {
        const months = await fetchTreasuryMonthly(env.treasuryFromYear)
        const last = months.at(-1)
        return `${months.length} monthly points · latest ${last?.date}: $${Math.round((last?.value ?? 0) / 1e9)}B`
      }),
    )
  }

  if (env.fredKey) {
    results.push(
      await timed('FRED observations', 'fred', async () => {
        const pts = await fetchFredSeries(env.fredKey, env.fredSeries)
        return `Series ${env.fredSeries} · ${pts.length} observations`
      }),
    )
  } else {
    results.push({
      id: 'fred',
      name: 'FRED observations',
      status: 'skip',
      ms: 0,
      detail: 'Set FRED_API_KEY in .env to test',
    })
  }

  if (env.groqKey) {
    results.push({
      id: 'groq',
      name: 'Groq API key',
      status: 'warn',
      ms: 0,
      detail: 'Configured · use Copilot module for live inference test',
    })
  } else {
    results.push({
      id: 'groq',
      name: 'Groq API key',
      status: 'skip',
      ms: 0,
      detail: 'Set GROQ_API_KEY in .env to test copilot',
    })
  }

  return {
    ranAt: new Date().toISOString(),
    authRequired: authRequired(),
    config: {
      ...env,
      groq: Boolean(env.groqKey),
      fred: Boolean(env.fredKey),
    },
    results,
  }
}