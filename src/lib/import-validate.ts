const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

export type ImportRow = { date: string; value: number }

export function parseAggregateCsv(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (!lines.length) throw new Error('File is empty')
  const header = lines.shift()!.trim().toLowerCase()
  if (header !== 'date,value') throw new Error('CSV header must be exactly date,value')
  const rows: ImportRow[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const [date, valueStr] = line.split(',')
    const value = Number(valueStr)
    if (!MONTH.test(date)) throw new Error(`Invalid month: ${date}`)
    if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid value for ${date}`)
    rows.push({ date, value })
  }
  return validateRows(rows)
}

export function parseAggregateJson(text: string): ImportRow[] {
  const parsed = JSON.parse(text) as unknown
  if (!Array.isArray(parsed)) throw new Error('JSON must be an array')
  const rows = parsed.map((r) => ({
    date: String((r as ImportRow).date),
    value: Number((r as ImportRow).value),
  }))
  return validateRows(rows)
}

export function validateRows(rows: ImportRow[]): ImportRow[] {
  if (!rows.length) throw new Error('No data rows')
  const dates = rows.map((r) => r.date)
  if (dates.some((d) => !MONTH.test(d))) throw new Error('All dates must be YYYY-MM')
  if (rows.some((r) => !Number.isFinite(r.value) || r.value < 0)) {
    throw new Error('Values must be nonnegative numbers')
  }
  if (new Set(dates).size !== dates.length) throw new Error('Duplicate months in file')
  return rows.sort((a, b) => a.date.localeCompare(b.date))
}