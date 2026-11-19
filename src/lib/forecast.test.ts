import { describe, expect, it } from 'vitest'
import { caseScore, forecast, solveKnapsack } from './forecast'

describe('forecast', () => {
  const obs = Array.from({ length: 24 }, (_, i) => ({
    value: 100 + i,
  }))

  it('produces horizon length', () => {
    const out = forecast(obs, 'Seasonal naïve', 6)
    expect(out).toHaveLength(6)
  })
})

describe('caseScore', () => {
  it('ranks higher value cases', () => {
    const a = { p: 0.5, value: 10000, cost: 100, burden: 1 }
    const b = { p: 0.5, value: 5000, cost: 100, burden: 1 }
    expect(caseScore(a)).toBeGreaterThan(caseScore(b))
  })
})

describe('solveKnapsack', () => {
  it('respects capacity', () => {
    const cases = [
      { id: 'a', p: 1, value: 100, cost: 0, hours: 3, burden: 0 },
      { id: 'b', p: 1, value: 80, cost: 0, hours: 2, burden: 0 },
    ]
    const best = solveKnapsack(cases, 4, 100)
    expect(best.ids.length).toBeGreaterThan(0)
  })
})