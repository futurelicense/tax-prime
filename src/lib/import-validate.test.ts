import { describe, expect, it } from 'vitest'
import { parseAggregateCsv, validateRows } from './import-validate'

describe('parseAggregateCsv', () => {
  it('accepts valid file', () => {
    const rows = parseAggregateCsv('date,value\n2024-01,100\n2024-02,200\n')
    expect(rows).toHaveLength(2)
  })

  it('rejects duplicate months', () => {
    expect(() => validateRows([{ date: '2024-01', value: 1 }, { date: '2024-01', value: 2 }])).toThrow(
      /Duplicate/,
    )
  })
})