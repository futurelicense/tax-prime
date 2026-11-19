export type WorkspaceId = 'demo' | 'research'
export type Role = 'Analyst' | 'Reviewer' | 'Administrator'

export type Observation = { date: string; value: number; source: string }
export type Case = {
  id: string
  p: number
  value: number
  cost: number
  hours: number
  burden: number
}
export type SourceSnapshot = {
  id: string
  name: string
  date: string
  count: number
  checksum?: string
  connector?: string
}
export type ConnectorState = {
  status: 'Connected' | 'Error'
  lastSync: string
  rows?: number
  checksum?: string
  error?: string
}
export type ForecastRun = {
  id: string
  date: string
  method: string
  h: number
  values: number[]
  low: number[]
  high: number[]
  source: string[]
  version: number
  narrative?: string
  narrativeAt?: string
}
export type Scenario = {
  id: string
  name: string
  run: string
  shock: number
  growth: number
  values: number[]
  date: string
  narrative?: string
  narrativeAt?: string
}
export type Decision = {
  id: string
  run: string
  scenario: string | null
  status: string
  rationale: string
  date: string
  review: string
  reviewed?: string
}
export type Report = {
  id: string
  date: string
  decision: string
  run: string
  scenario: string | null
  mode: WorkspaceId
  method: string
  total: number
  source: string[]
  rationale: string
  review: string
}
export type EvaluationRecord = {
  id: string
  date: string
  cutoff: string
  actual: number[]
  prediction: number[]
  alt: number[]
  baseline: { mae: number; rmse: number; smape: number }
  alternate: { mae: number; rmse: number; smape: number }
}
export type WorkspaceState = {
  obs: Observation[]
  cases: Case[]
  source: SourceSnapshot[]
  runs: ForecastRun[]
  scenarios: Scenario[]
  decisions: Decision[]
  audit: { date: string; actor: string; action: string; detail: string }[]
  reports: Report[]
  evaluations: EvaluationRecord[]
  model: {
    name: string
    version: number
    features: string
    notes: string
  }
  opt: {
    id: string
    capacity: number
    lambda: number
    ids: string[]
    value: number
    hours: number
    date: string
  } | null
  chat: { q: string; a: string; date: string; engine?: string }[]
  macro: {
    series: string
    points: { date: string; value: number }[]
    date: string
  } | null
  connectors: Record<string, ConnectorState>
}