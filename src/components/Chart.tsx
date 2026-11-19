import { num } from '~/lib/format'

export function Chart({ vals, other = [] }: { vals: number[]; other?: number[] }) {
  if (!vals.length)
    return <p className="py-8 text-center text-[#64778a]">Import observations to visualize trends.</p>
  const all = [...vals, ...other].filter(Number.isFinite)
  const max = Math.max(...all)
  const min = Math.min(...all)
  const range = max - min || 1
  const W = 680
  const H = 230
  const denom = Math.max(vals.length - 1, other.length - 1, 1)
  const pt = (v: number, i: number) =>
    `${40 + (i * (W - 60)) / denom},${H - 28 - ((v - min) / range) * (H - 55)}`

  return (
    <svg className="w-full h-auto block" viewBox={`0 0 ${W} ${H}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1="40" x2="660" y1={25 + i * 44} y2={25 + i * 44} stroke="#e0e8ee" />
          <text x="3" y={29 + i * 44} fontSize="9" fill="#6a8190">
            {num((max - (i * range) / 4) / 1e9)}B
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="#187d85" strokeWidth="3" points={vals.map(pt).join(' ')} />
      {other.length ? (
        <polyline
          fill="none"
          stroke="#d99745"
          strokeWidth="3"
          strokeDasharray="6 4"
          points={other.map(pt).join(' ')}
        />
      ) : null}
      <text x="40" y="222" fontSize="10" fill="#64778a">
        Earlier
      </text>
      <text x="620" y="222" fontSize="10" fill="#64778a">
        Later
      </text>
    </svg>
  )
}