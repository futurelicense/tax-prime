import { createFileRoute } from '@tanstack/react-router'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'
import { groqComplete } from '~/server/groq'
import { serverEnv } from '~/server/env'
import { systemPromptForMode } from '~/server/groq-prompts'
import { defaultQuestionForMode, type GroqAlignMode } from '~/lib/prediction-context'

export const Route = createFileRoute('/api/copilot')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            question?: string
            context?: unknown
            mode?: GroqAlignMode
          }
          const mode: GroqAlignMode = body.mode ?? 'general'
          const question = (body.question?.trim() || defaultQuestionForMode(mode)).trim()
          if (!question) {
            return Response.json({ error: 'question required' }, { status: 400 })
          }
          const sys = systemPromptForMode(mode)
          const user = `CONTEXT:\n${JSON.stringify(body.context ?? {}, null, 0)}\n\nQUESTION:\n${question}`
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