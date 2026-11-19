import { createFileRoute } from '@tanstack/react-router'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'
import { groqComplete } from '~/server/groq'
import { serverEnv } from '~/server/env'

export const Route = createFileRoute('/api/copilot')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            question?: string
            context?: unknown
          }
          const question = body.question?.trim()
          if (!question) {
            return Response.json({ error: 'question required' }, { status: 400 })
          }
          const sys =
            'You are TAX-PRIME research copilot. Answer only from WORKSPACE_CONTEXT JSON. Cite source snapshot IDs when mentioning data. If context lacks information, say so. Never claim operational tax authority. Keep answers concise.'
          const user = `WORKSPACE_CONTEXT:\n${JSON.stringify(body.context ?? {}, null, 0)}\n\nQUESTION:\n${question}`
          if (!serverEnv().groqKey) {
            return Response.json({
              answer:
                'Groq is not configured. Set GROQ_API_KEY in .env. Numeric forecasts and audit trails remain available without AI.',
              engine: 'local-server',
            })
          }
          const answer = await groqComplete(sys, user)
          return Response.json({ answer, engine: 'groq-server' })
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : 'Copilot failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})