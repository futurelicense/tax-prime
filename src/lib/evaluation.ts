import { forecast } from '~/lib/forecast'

export type MethodMetrics = { mae: number; rmse: number; smape: number }

function metrics(prediction: number[], actual: number[]): MethodMetrics {
  const e = prediction.map((v, i) => v - actual[i])
  const mae = e.reduce((a, b) => a + Math.abs(b), 0) / actual.length
  const rmse = Math.sqrt(e.reduce((a, b) => a + b * b, 0) / actual.length)
  const smape =
    prediction.reduce((a, v, i) => {
      const den = Math.abs(v) + Math.abs(actual[i])
      return a + (den ? (200 * Math.abs(v - actual[i])) / den : 0)
    }, 0) / actual.length
  return { mae, rmse, smape }
}

export function holdoutEvaluate(obs: { date: string; value: number }[]) {
  if (obs.length < 24) throw new Error('At least 24 observations required for chronological holdout')
  const k = obs.length - 12
  const train = obs.slice(0, k)
  const actual = obs.slice(k).map((o) => o.value)
  const prediction = forecast(train, 'Seasonal naïve', 12)
  const alt = forecast(train, 'Moving average', 12)
  return {
    cutoff: train.at(-1)!.date,
    actual,
    prediction,
    alt,
    baseline: metrics(prediction, actual),
    alternate: metrics(alt, actual),
  }
}