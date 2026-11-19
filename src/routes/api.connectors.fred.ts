import { createFileRoute } from '@tanstack/react-router'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'
import { fetchFredSeries } from '~/lib/connectors/fred'
import { digest } from '~/lib/format'
import { serverEnv } from '~/server/env'

export const Route = createFileRoute('/api/connectors/fred')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      POST: async () => {
        try {
          const { fredKey, fredSeries } = serverEnv()
          if (!fredKey) {
            return Response.json({ error: 'FRED_API_KEY not configured' }, { status: 400 })
          }
          const points = await fetchFredSeries(fredKey, fredSeries)
          const raw = JSON.stringify(points)
          return Response.json({
            ok: true,
            series: fredSeries,
            points,
            checksum: digest(raw),
          })
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : 'FRED sync failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})