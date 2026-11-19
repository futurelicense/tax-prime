import { createFileRoute } from '@tanstack/react-router'
import { accessPassword, authRequired, sessionCookie } from '~/server/auth'
import { createSession } from '~/server/sessions'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authRequired()) {
          return Response.json({ ok: true, authRequired: false })
        }
        const body = (await request.json()) as { password?: string }
        if (body.password !== accessPassword()) {
          return Response.json({ error: 'Invalid password' }, { status: 401 })
        }
        const token = await createSession()
        return new Response(JSON.stringify({ ok: true, authRequired: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': sessionCookie(token),
          },
        })
      },
    },
  },
})