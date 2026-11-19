import { createFileRoute } from '@tanstack/react-router'
import { authRequired } from '~/server/auth'
import { serverEnv } from '~/server/env'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        const env = serverEnv()
        return Response.json({
          status: 'ok',
          time: new Date().toISOString(),
          authRequired: authRequired(),
          integrations: {
            groq: Boolean(env.groqKey),
            fred: Boolean(env.fredKey),
            treasury: true,
          },
          treasuryFromYear: env.treasuryFromYear,
          docs: '/docs/REALTIME-TESTING.md',
          uiLab: '/demo/live-test',
        })
      },
    },
  },
})