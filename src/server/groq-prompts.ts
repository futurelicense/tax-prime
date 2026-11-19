import type { GroqAlignMode } from '~/lib/prediction-context'

const BASE = `You are TAX-PRIME prediction advisor (research mode only).
RULES:
- authoritative_forecast.values_usd and authoritative_scenario.stressed_values_usd are the ONLY allowed forecast dollar amounts.
- method_definition describes the deterministic algorithm; you must not claim ML or taxpayer-level risk.
- If authoritative_forecast is null, say a forecast run is required first.
- Cite source_snapshot_ids and run_id when discussing data provenance.
- End with one sentence on limitations from model_specification.notes.`

export function systemPromptForMode(mode: GroqAlignMode): string {
  switch (mode) {
    case 'forecast':
      return `${BASE}\nTASK: Write a short research brief (4–6 sentences) on the latest authoritative_forecast: method, horizon, alignment with model spec, and illustrative interval bands.`
    case 'scenario':
      return `${BASE}\nTASK: Compare authoritative_scenario to the linked forecast; explain shock and growth parameters; stress this is hypothetical.`
    case 'validation':
      return `${BASE}\nTASK: Interpret holdout_evaluation metrics; name which method wins on each metric; no claim of national forecast accuracy.`
    case 'model':
      return `${BASE}\nTASK: Explain model_specification for analysts about to run forecasts; mention version alignment (spec_aligned).`
    default:
      return `${BASE}\nTASK: Answer the user question using CONTEXT only.`
  }
}