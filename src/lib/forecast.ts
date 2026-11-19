export type ForecastMethod =
  | 'Seasonal naïve'
  | 'Moving average'
  | 'Last observation'

export function forecast(
  data: { value: number }[],
  method: ForecastMethod,
  h: number,
): number[] {
  const a = data.map((x) => x.value)
  const out: number[] = []
  if (a.length < 12) throw new Error('At least 12 monthly observations required.')
  for (let i = 0; i < h; i++) {
    let v: number
    if (method === 'Seasonal naïve') v = a[a.length - 12]
    else if (method === 'Moving average')
      v = a.slice(-6).reduce((x, y) => x + y, 0) / 6
    else v = a[a.length - 1]
    out.push(v)
    a.push(v)
  }
  return out
}

export function caseScore(
  c: { p: number; value: number; cost: number; burden: number },
  lambda = 100,
) {
  return c.p * c.value - c.cost - lambda * c.burden
}

export function solveKnapsack(
  cases: { id: string; hours: number; p: number; value: number; cost: number; burden: number }[],
  capacity: number,
  lambda: number,
) {
  const dp = Array.from({ length: capacity + 1 }, () => ({
    v: 0,
    ids: [] as string[],
  }))
  for (const c of cases) {
    for (let t = capacity; t >= c.hours; t--) {
      const v = dp[t - c.hours].v + caseScore(c, lambda)
      if (v > dp[t].v) dp[t] = { v, ids: [...dp[t - c.hours].ids, c.id] }
    }
  }
  return dp[capacity]
}