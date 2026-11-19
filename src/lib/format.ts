export const money = (x: number) =>
  Number.isFinite(x)
    ? '$' + x.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : 'N/A'

export const num = (x: number) =>
  Number.isFinite(x)
    ? x.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : 'N/A'

export const digest = (t: string) => {
  let h = 0
  for (let i = 0; i < t.length; i++) h = (Math.imul(31, h) + t.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

export const uid = () => Math.random().toString(36).slice(2, 10)
export const now = () => new Date().toISOString()