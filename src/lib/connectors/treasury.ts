const FISCAL = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service'

async function fiscalPages(url: string, max = 12) {
  let page = 1
  const all: Record<string, unknown>[] = []
  for (;;) {
    const u =
      url + (url.includes('?') ? '&' : '?') + `page[number]=${page}&page[size]=10000`
    const r = await fetch(u)
    if (!r.ok) throw new Error(`Treasury API HTTP ${r.status}`)
    const j = (await r.json()) as {
      data?: Record<string, unknown>[]
      meta?: { total_pages?: number }
    }
    all.push(...(j.data ?? []))
    const pages = j.meta?.total_pages ?? 1
    if (!j.data?.length || page >= pages || page >= max) break
    page++
  }
  return all
}

export async function fetchTreasuryMonthly(fromYear: number) {
  const url = `${FISCAL}/v2/revenue/rcm?filter=record_calendar_year:gte:${fromYear}&fields=record_date,net_collections_amt,record_calendar_year,record_calendar_month`
  const rows = await fiscalPages(url)
  const by = new Map<string, number>()
  for (const r of rows) {
    const year = String(r.record_calendar_year)
    const mo = String(r.record_calendar_month).padStart(2, '0')
    const k = `${year}-${mo}`
    by.set(k, (by.get(k) ?? 0) + Number(r.net_collections_amt))
  }
  const out = [...by.entries()]
    .map(([date, value]) => ({ date, value: Math.round(value) }))
    .filter(
      (r) =>
        /^\d{4}-(0[1-9]|1[0-2])$/.test(r.date) &&
        Number.isFinite(r.value) &&
        r.value > 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  if (out.length < 12) throw new Error('Treasury sync returned insufficient months.')
  return out
}