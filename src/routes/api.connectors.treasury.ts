import { createFileRoute } from '@tanstack/react-router'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'
import { fetchTreasuryMonthly } from '~/lib/connectors/treasury'
import { digest } from '~/lib/format'
import { serverEnv } from '~/server/env'

export const Route = createFileRoute('/api/connectors/treasury')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      POST: async () => {
        try {
          const { treasuryFromYear } = serverEnv()
          const months = await fetchTreasuryMonthly(treasuryFromYear)
          const raw = JSON.stringify(months)
          return Response.json({
            ok: true,
            months,
            checksum: digest(raw),
            fromYear: treasuryFromYear,
          })
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : 'Treasury sync failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})