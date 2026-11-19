import { createFileRoute } from '@tanstack/react-router'
import { runIntegrationProbes } from '~/server/integration-probe'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'

export const Route = createFileRoute('/api/integrations/probe')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const deep = url.searchParams.get('deep') === '1'
        const report = await runIntegrationProbes(deep)
        return Response.json(report)
      },
    },
  },
})