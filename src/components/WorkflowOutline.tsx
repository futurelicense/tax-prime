import { Link } from '@tanstack/react-router'
import type { WorkspaceId } from '~/lib/types'
import type { ModuleSlug } from '~/lib/modules'

type Step = {
  phase: string
  title: string
  module: ModuleSlug
  who: string
  actions: string[]
  outcome: string
}

const WORKFLOW: Step[] = [
  {
    phase: 'START',
    title: 'Choose workspace & role',
    module: 'dashboard',
    who: 'All users',
    actions: [
      'Sign in if your deployment requires a password',
      'Pick Simulation (demo) or Public research workspace',
      'Set role: Analyst to work; Reviewer to approve briefs',
    ],
    outcome: 'Correct data boundary (synthetic vs aggregate-only)',
  },
  {
    phase: 'DATA',
    title: 'Bring in aggregate evidence',
    module: 'data-hub',
    who: 'Analyst',
    actions: [
      'Sync U.S. Treasury Revenue Collections (public API)',
      'Optionally sync FRED macro series (requires server API key)',
      'Or import CSV/JSON with header date,value — no taxpayer PII',
    ],
    outcome: 'Snapshot ID + checksum on every import',
  },
  {
    phase: 'DATA',
    title: 'Verify the active series',
    module: 'explorer',
    who: 'Analyst',
    actions: ['Review months, sources, and trend chart', 'Export or filter if needed'],
    outcome: 'Confidence in data before modeling',
  },
  {
    phase: 'MODEL',
    title: 'Document model assumptions',
    module: 'model',
    who: 'Analyst',
    actions: [
      'Name the model, list features and exclusions',
      'Save a new specification version when assumptions change',
    ],
    outcome: 'Versioned model card linked to forecasts',
  },
  {
    phase: 'PREDICT',
    title: 'Run a baseline forecast',
    module: 'predict',
    who: 'Analyst',
    actions: [
      'Need ≥12 monthly observations',
      'Choose method (seasonal naïve, moving average, or last value)',
      'Set horizon (1–24 months) and save the run',
    ],
    outcome: 'Versioned forecast run with source references',
  },
  {
    phase: 'PREDICT',
    title: 'Stress-test with scenarios',
    module: 'scenario',
    who: 'Analyst',
    actions: [
      'Apply shock % and growth % to the latest forecast',
      'Compare baseline vs stressed series on the chart',
    ],
    outcome: 'Saved scenario for decisions and reporting',
  },
  {
    phase: 'ASSESS',
    title: 'Prioritize & allocate (demo only)',
    module: 'prioritize',
    who: 'Analyst (simulation workspace)',
    actions: [
      'Add fictional intervention candidates',
      'Rank by net score; open optimization when ready',
    ],
    outcome: 'Synthetic case portfolio — not real audits',
  },
  {
    phase: 'ASSESS',
    title: 'Capacity optimization (demo only)',
    module: 'optimize',
    who: 'Analyst (simulation workspace)',
    actions: ['Set staff hours and burden penalty', 'Solve knapsack allocation'],
    outcome: 'Recommended fictional case mix under capacity',
  },
  {
    phase: 'LEARN',
    title: 'Validate forecast quality',
    module: 'validation',
    who: 'Analyst',
    actions: ['Run chronological holdout (last 12 months)', 'Compare MAE / RMSE / sMAPE across methods'],
    outcome: 'Evidence for which baseline to trust',
  },
  {
    phase: 'DELIVER',
    title: 'Draft AI explanation (optional)',
    module: 'copilot',
    who: 'Analyst',
    actions: [
      'Ask about saved runs, scenarios, or provenance',
      'Groq answers only from workspace context (server-side key)',
    ],
    outcome: 'Advisory text — must be human-reviewed',
  },
  {
    phase: 'GOVERN',
    title: 'Submit & review decision',
    module: 'governance',
    who: 'Analyst → Reviewer',
    actions: [
      'Analyst: submit brief with rationale tied to forecast/scenario',
      'Reviewer: approve or request changes with written rationale',
    ],
    outcome: 'Approved decision in audit log',
  },
  {
    phase: 'DELIVER',
    title: 'Publish research brief',
    module: 'reports',
    who: 'Analyst',
    actions: ['Generate report from approved decision', 'Download or print text brief'],
    outcome: 'Evidence-linked publication artifact',
  },
  {
    phase: 'OPS',
    title: 'Persist & test integrations',
    module: 'live-test',
    who: 'Any',
    actions: [
      'Run API probes (Treasury / FRED / config)',
      'Load sample CSV; follow E2E checklist',
      'Dashboard: Save to server / Load from server',
    ],
    outcome: 'Reproducible workspace across sessions',
  },
]

const PHASE_COLORS: Record<string, string> = {
  START: 'bg-[#eaf1f7] text-[#24516a]',
  DATA: 'bg-[#e8f2f2] text-[#16706d]',
  MODEL: 'bg-[#f0f4ff] text-[#3d5a80]',
  PREDICT: 'bg-[#fff2dc] text-[#a96515]',
  ASSESS: 'bg-[#fce8f0] text-[#8b3a62]',
  LEARN: 'bg-[#f3e8ff] text-[#6b21a8]',
  DELIVER: 'bg-[#e5f3ef] text-[#206459]',
  GOVERN: 'bg-[#f5f5f5] text-[#4a5568]',
  OPS: 'bg-[#fbe8e8] text-[#ae3c3c]',
}

export function WorkflowOutline({
  space,
  compact = false,
}: {
  space: WorkspaceId
  compact?: boolean
}) {
  const steps = WORKFLOW.filter((s) => {
    if (space === 'research' && (s.module === 'prioritize' || s.module === 'optimize')) {
      return false
    }
    return true
  })

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {['DATA', 'MODEL', 'PREDICT', 'ASSESS', 'DELIVER'].map((p) => (
          <span
            key={p}
            className={`px-2 py-1 rounded font-semibold tracking-wide ${PHASE_COLORS[p] ?? 'bg-gray-100'}`}
          >
            {p}
          </span>
        ))}
        <span className="text-[#64778a] self-center">→ human review → validate → refine</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#64778a] leading-relaxed">
        TAX-PRIME follows <strong className="text-[#182a3b]">MODEL → PREDICT → ASSESS → DELIVER</strong>, with continuous{' '}
        <strong className="text-[#182a3b]">measure / validate / refine</strong>. Numbers come from deterministic code;
        Groq is advisory only. Aggregate public data or synthetic cases — never individual taxpayer records.
      </p>

      <div className="grid gap-3">
        {steps.map((step, i) => (
          <article
            key={`${step.module}-${i}`}
            className="border border-[#e0e6ed] rounded-lg p-4 bg-white flex flex-col sm:flex-row gap-3 sm:items-start"
          >
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[#64778a] text-xs font-mono w-6">{i + 1}</span>
              <span
                className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${PHASE_COLORS[step.phase] ?? ''}`}
              >
                {step.phase}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#122d43]">{step.title}</h3>
              <p className="text-[11px] text-[#64778a] mt-0.5">
                Role: {step.who}
              </p>
              <ul className="mt-2 text-sm text-[#53677a] list-disc pl-4 space-y-0.5">
                {step.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="text-xs text-[#087f80] mt-2">
                Outcome: {step.outcome}
              </p>
            </div>
            <Link
              to="/$space/$module"
              params={{ space, module: step.module }}
              className="shrink-0 text-sm text-[#087f80] font-medium hover:underline whitespace-nowrap"
            >
              Open module →
            </Link>
          </article>
        ))}
      </div>

      <aside className="rounded-lg border border-[#cbe4dc] bg-[#e5f3ef] px-4 py-3 text-xs text-[#206459]">
        <strong>Research boundary:</strong> This platform does not make operational tax decisions. In{' '}
        <em>research</em> workspace, synthetic case scoring is hidden. Set server keys in <code>.env</code> for FRED and
        Groq; use <code>TAX_PRIME_ACCESS_PASSWORD</code> before internet deployment.
      </aside>
    </div>
  )
}