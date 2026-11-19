import type { WorkspaceId, WorkspaceState } from './types'
import { now, uid } from './format'

export function freshWorkspace(demo: boolean): WorkspaceState {
  const obs = demo
    ? Array.from({ length: 48 }, (_, i) => ({
        date: `${2022 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`,
        value: Math.round(
          250_000_000_000 +
            i * 1_500_000_000 +
            45_000_000_000 * Math.sin((i * Math.PI) / 6),
        ),
        source: 'SYN-001',
      }))
    : []
  const cases = demo
    ? Array.from({ length: 24 }, (_, i) => ({
        id: 'SIM-' + String(i + 1).padStart(3, '0'),
        p: (20 + ((i * 17) % 70)) / 100,
        value: 5000 + ((i * 7291) % 45000),
        cost: 300 + ((i * 137) % 1200),
        hours: 2 + (i % 7),
        burden: 1 + (i % 5),
      }))
    : []

  return {
    obs,
    cases,
    source: demo
      ? [{ id: 'SYN-001', name: 'Seeded monthly revenue series', date: now(), count: 48 }]
      : [],
    runs: [],
    scenarios: [],
    decisions: [],
    audit: [],
    reports: [],
    evaluations: [],
    model: {
      name: 'Seasonal baseline',
      version: 1,
      features: 'Historical aggregate receipts; month of year',
      notes: 'No individual identifiers or inferred misconduct',
    },
    opt: null,
    chat: [],
    macro: null,
    connectors: {},
  }
}

export function migrateWorkspace(x: WorkspaceState): WorkspaceState {
  if (!x.connectors) x.connectors = {}
  if (x.macro === undefined) x.macro = null
  return x
}

export const STORAGE_KEY = (space: WorkspaceId) => `taxprime-${space}`

export function logAudit(
  s: WorkspaceState,
  actor: string,
  action: string,
  detail = '',
) {
  s.audit.unshift({ date: now(), actor, action, detail })
}

export function newSnapshotId(prefix: string) {
  return `${prefix}-${uid()}`
}