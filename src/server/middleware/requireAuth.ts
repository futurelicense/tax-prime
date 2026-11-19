import { createMiddleware } from '@tanstack/react-start'
import { authorizeRequest } from '~/server/auth'

export const requireAuthMiddleware = createMiddleware().server(async ({ request, next }) => {
  const denied = await authorizeRequest(request)
  if (denied) return denied
  return next()
})