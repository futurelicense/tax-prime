import { createFileRoute } from '@tanstack/react-router'
import { authRequired, authorizeRequest } from '~/server/auth'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const required = authRequired()
        if (!required) return Response.json({ authenticated: true, authRequired: false })
        const denied = await authorizeRequest(request)
        return Response.json({
          authenticated: !denied,
          authRequired: true,
        })
      },
    },
  },
})