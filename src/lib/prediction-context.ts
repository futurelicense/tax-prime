import type { ForecastMethod } from '~/lib/forecast'
import type { WorkspaceId, WorkspaceState } from '~/lib/types'

const METHOD_DEFINITION: Record<ForecastMethod, string> = {
  'Seasonal naïve':
    'Each future month equals the receipt value from 12 months earlier in the rolling series (seasonal repetition).',
  'Moving average':
    'Each future month equals the mean of the last 6 observed months, then that level is carried forward.',
  'Last observation': 'Each future month repeats the most recent observed receipt value.',
}

export type GroqAlignMode = 'general' | 'forecast' | 'scenario' | 'validation' | 'model'

export function buildPredictionAlignedContext(
  state: WorkspaceState,
  space: WorkspaceId,
) {
  const latest = state.runs[0]
  const scenario = state.scenarios[0]
  const evaluation = state.evaluations[0]

  return {
    trust_boundary:
      'Use only numeric fields under authoritative_forecast, authoritative_scenario, and holdout_evaluation. Do not invent dollars or percentages. Do not recommend enforcement actions.',
    workspace_mode: space,
    model_specification: {
      name: state.model.name,
      version: state.model.version,
      features: state.model.features,
      notes: state.model.notes,
    },
    data_lineage: {
      observation_count: state.obs.length,
      date_range:
        state.obs.length > 0
          ? `${state.obs[0].date} … ${state.obs[state.obs.length - 1].date}`
          : null,
      source_snapshot_ids: state.source.map((s) => s.id),
      macro_series: state.macro?.series ?? null,
    },
    authoritative_forecast: latest
      ? {
          run_id: latest.id,
          method: latest.method,
          method_definition:
            METHOD_DEFINITION[latest.method as ForecastMethod] ?? latest.method,
          horizon_months: latest.h,
          values_usd: latest.values,
          interval_low_usd: latest.low,
          interval_high_usd: latest.high,
          model_version_at_run: latest.version,
          model_version_current: state.model.version,
          spec_aligned: latest.version === state.model.version,
          horizon_total_usd: latest.values.reduce((a, b) => a + b, 0),
        }
      : null,
    authoritative_scenario: scenario
      ? {
          scenario_id: scenario.id,
          name: scenario.name,
          linked_run_id: scenario.run,
          shock_percent: scenario.shock,
          growth_percent_annual: scenario.growth,
          stressed_values_usd: scenario.values,
          stressed_total_usd: scenario.values.reduce((a, b) => a + b, 0),
        }
      : null,
    holdout_evaluation: evaluation
      ? {
          evaluation_id: evaluation.id,
          training_cutoff: evaluation.cutoff,
          seasonal_naive: evaluation.baseline,
          moving_average: evaluation.alternate,
          actual_holdout_usd: evaluation.actual,
        }
      : null,
    available_methods: Object.keys(METHOD_DEFINITION),
  }
}

export function defaultQuestionForMode(mode: GroqAlignMode): string {
  switch (mode) {
    case 'forecast':
      return 'Explain this forecast in plain language: tie the method to the model specification, cite run_id and source snapshots, and state limitations.'
    case 'scenario':
      return 'Explain how the scenario differs from the linked forecast using only authoritative fields; clarify what is simulated vs observed.'
    case 'validation':
      return 'Summarize holdout results: which baseline performed better on MAE/RMSE/sMAPE and what that implies for research use (not operational accuracy claims).'
    case 'model':
      return 'Explain how the current model specification versions features and exclusions, and how analysts should align the next forecast run with this spec.'
    default:
      return 'Answer using only the provided context.'
  }
}