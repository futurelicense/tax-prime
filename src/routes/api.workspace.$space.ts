import { createFileRoute } from '@tanstack/react-router'
import { requireAuthMiddleware } from '~/server/middleware/requireAuth'
import type { WorkspaceId, WorkspaceState } from '~/lib/types'
import { loadWorkspaceServer, saveWorkspaceServer } from '~/server/workspace-store'

function parseSpace(space: string): WorkspaceId | null {
  return space === 'demo' || space === 'research' ? space : null
}

export const Route = createFileRoute('/api/workspace/$space')({
  server: {
    middleware: [requireAuthMiddleware],
    handlers: {
      GET: async ({ params }) => {
        const space = parseSpace(params.space)
        if (!space) return Response.json({ error: 'invalid space' }, { status: 400 })
        const data = await loadWorkspaceServer(space)
        return Response.json(data)
      },
      PUT: async ({ request, params }) => {
        const space = parseSpace(params.space)
        if (!space) return Response.json({ error: 'invalid space' }, { status: 400 })
        const body = (await request.json()) as WorkspaceState
        await saveWorkspaceServer(space, body)
        return Response.json({ ok: true })
      },
    },
  },
})