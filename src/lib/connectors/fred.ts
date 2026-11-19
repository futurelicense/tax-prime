export async function fetchFredSeries(apiKey: string, seriesId: string) {
  const u = new URL('https://api.stlouisfed.org/fred/series/observations')
  u.searchParams.set('series_id', seriesId)
  u.searchParams.set('api_key', apiKey)
  u.searchParams.set('file_type', 'json')
  u.searchParams.set('observation_start', '2018-01-01')
  const r = await fetch(u)
  if (!r.ok) throw new Error(`FRED HTTP ${r.status}`)
  const j = (await r.json()) as {
    observations?: { date: string; value: string }[]
  }
  return (j.observations ?? [])
    .map((o) => ({ date: o.date.slice(0, 7), value: Number(o.value) }))
    .filter((o) => Number.isFinite(o.value))
}