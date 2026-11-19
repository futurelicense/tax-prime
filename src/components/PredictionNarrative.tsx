import { Btn } from '~/components/ui'
import { apiFetch } from '~/lib/api-fetch'
import {
  buildPredictionAlignedContext,
  defaultQuestionForMode,
  type GroqAlignMode,
} from '~/lib/prediction-context'
import { now } from '~/lib/format'
import type { WorkspaceId, WorkspaceState } from '~/lib/types'
import { logAudit } from '~/hooks/useWorkspace'

type Props = {
  mode: GroqAlignMode
  space: WorkspaceId
  role: string
  state: WorkspaceState
  busy: boolean
  setBusy: (b: boolean) => void
  notify: (t: string) => void
  onSaved?: (answer: string) => void
  label?: string
}

export function PredictionNarrative({
  mode,
  space,
  role,
  state,
  busy,
  setBusy,
  notify,
  onSaved,
  label,
}: Props) {
  const run = async () => {
    if (mode === 'forecast' && !state.runs[0]) {
      notify('Create a forecast run first')
      return
    }
    if (mode === 'scenario' && !state.scenarios[0]) {
      notify('Save a scenario first')
      return
    }
    if (mode === 'validation' && !state.evaluations[0]) {
      notify('Run holdout validation first')
      return
    }
    setBusy(true)
    try {
      const res = await apiFetch('/api/copilot', {
        method: 'POST',
        body: JSON.stringify({
          mode,
          question: defaultQuestionForMode(mode),
          context: buildPredictionAlignedContext(state, space),
        }),
      })
      const data = (await res.json()) as { answer?: string; engine?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Narrative failed')
      onSaved?.(data.answer!)
      notify(data.engine === 'groq-server' ? 'Model-aligned narrative saved' : data.answer!.slice(0, 80))
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Groq error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 border-t border-[#edf0f4] pt-4">
      <p className="text-xs text-[#64778a] mb-2">
        Groq explains using <strong>authoritative_forecast</strong> numbers from the deterministic model —
        it does not recompute predictions.
      </p>
      <Btn primary disabled={busy} onClick={() => void run()}>
        {label ?? 'Generate model-aligned Groq narrative'}
      </Btn>
    </div>
  )
}

export function saveForecastNarrative(
  patch: (fn: (s: WorkspaceState) => void) => void,
  role: string,
  answer: string,
) {
  patch((s) => {
    if (!s.runs[0]) return
    s.runs[0].narrative = answer
    s.runs[0].narrativeAt = now()
    logAudit(s, role, 'Forecast narrative', s.runs[0].id)
  })
}

export function saveScenarioNarrative(
  patch: (fn: (s: WorkspaceState) => void) => void,
  role: string,
  answer: string,
) {
  patch((s) => {
    if (!s.scenarios[0]) return
    s.scenarios[0].narrative = answer
    s.scenarios[0].narrativeAt = now()
    logAudit(s, role, 'Scenario narrative', s.scenarios[0].id)
  })
}