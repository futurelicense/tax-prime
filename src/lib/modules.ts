export type ModuleSlug =
  | 'dashboard'
  | 'workflow'
  | 'live-test'
  | 'data-hub'
  | 'explorer'
  | 'model'
  | 'predict'
  | 'scenario'
  | 'prioritize'
  | 'optimize'
  | 'copilot'
  | 'governance'
  | 'reports'
  | 'validation'

export const MODULES: {
  slug: ModuleSlug
  name: string
  group?: string
  icon: string
  intro: string
}[] = [
  {
    slug: 'dashboard',
    name: 'Executive Dashboard',
    group: 'COMMAND CENTER',
    icon: '▦',
    intro: 'Revenue outlook, evidence quality and decision operations.',
  },
  {
    slug: 'workflow',
    name: 'System Workflow',
    group: 'COMMAND CENTER',
    icon: '◎',
    intro: 'How to use TAX-PRIME end to end — roles, modules, and expected outcomes.',
  },
  {
    slug: 'data-hub',
    name: 'Data Integration Hub',
    group: 'DATA FOUNDATION',
    icon: '▤',
    intro: 'Register sources, ingest aggregate observations and preserve provenance.',
  },
  {
    slug: 'live-test',
    name: 'Integration Test Lab',
    icon: '⚡',
    intro: 'Run live API probes, CSV ingestion tests, and the end-to-end checklist.',
  },
  {
    slug: 'explorer',
    name: 'Tax Data Explorer',
    icon: '⌕',
    intro: 'Inspect and export the active monthly aggregate series.',
  },
  {
    slug: 'model',
    name: 'Risk Modeling Studio',
    group: '01 · MODEL',
    icon: '◇',
    intro: 'Define research model features, exclusions and versioned assumptions.',
  },
  {
    slug: 'predict',
    name: 'Predictive Intelligence',
    group: '02 · PREDICT',
    icon: '↗',
    intro: 'Run reproducible aggregate forecasts with transparent baseline methods.',
  },
  {
    slug: 'scenario',
    name: 'Scenario Simulation Lab',
    icon: '◉',
    intro: 'Test the sensitivity of saved revenue forecasts to hypothetical changes.',
  },
  {
    slug: 'prioritize',
    name: 'Prioritization Engine',
    group: '03 · ASSESS & PRIORITIZE',
    icon: '≡',
    intro: 'Explore fictional case prioritization with transparent economic assumptions.',
  },
  {
    slug: 'optimize',
    name: 'Decision Optimization',
    icon: '⊞',
    intro: 'Allocate finite staff capacity across simulated interventions.',
  },
  {
    slug: 'copilot',
    name: 'Groq AI Copilot',
    group: '04 · DELIVER',
    icon: '✧',
    intro: 'Explain saved results using source-aware advisory AI.',
  },
  {
    slug: 'governance',
    name: 'Governance and Audit',
    icon: '✓',
    intro: 'Record human decisions and audit history.',
  },
  {
    slug: 'reports',
    name: 'Reports & Publications',
    icon: '▧',
    intro: 'Create evidence-linked research briefs after review.',
  },
  {
    slug: 'validation',
    name: 'Performance Validation',
    group: 'CONTINUOUS LEARNING',
    icon: '⟳',
    intro: 'Compare forecast methods on a chronological holdout.',
  },
]

export const moduleBySlug = (slug: string) =>
  MODULES.find((m) => m.slug === slug) ?? MODULES[0]