#!/usr/bin/env node
/** Live smoke test against running server (default http://localhost:3000) */
const base = process.env.TAX_PRIME_URL || 'http://localhost:3000'
const headers = {}
if (process.env.TAX_PRIME_ACCESS_PASSWORD) {
  headers.Authorization = `Bearer ${process.env.TAX_PRIME_ACCESS_PASSWORD}`
}

async function get(path) {
  const t0 = Date.now()
  const res = await fetch(`${base}${path}`, { headers })
  const body = await res.text()
  return { res, body, ms: Date.now() - t0 }
}

async function post(path, body) {
  const t0 = Date.now()
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { res, body: text, ms: Date.now() - t0 }
}

function ok(name, res, ms, snippet) {
  const mark = res.ok ? '✓' : '✗'
  console.log(`${mark} ${name} (${ms}ms) HTTP ${res.status}`)
  if (snippet) console.log(`  ${snippet.slice(0, 120)}`)
}

console.log(`TAX-PRIME smoke test → ${base}\n`)

const health = await get('/api/health')
ok('GET /api/health', health.res, health.ms, health.body)

const probe = await get('/api/integrations/probe')
ok('GET /api/integrations/probe', probe.res, probe.ms, probe.body)

const treasury = await post('/api/connectors/treasury')
ok('POST /api/connectors/treasury', treasury.res, treasury.ms, treasury.body)

const deep = await get('/api/integrations/probe?deep=1')
ok('GET /api/integrations/probe?deep=1', deep.res, deep.ms, deep.body)

const sample = await get('/samples/sample-revenue.csv')
ok('GET /samples/sample-revenue.csv', sample.res, sample.ms, sample.body.split('\n')[0])
if (!sample.body.startsWith('date,value')) {
  console.error('  expected CSV body, got HTML or empty response')
  process.exitCode = 1
}

process.exit(health.res.ok && probe.res.ok && treasury.res.ok ? 0 : 1)