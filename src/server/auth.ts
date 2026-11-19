import { isValidSession } from './sessions'

export function accessPassword(): string {
  return process.env.TAX_PRIME_ACCESS_PASSWORD?.trim() ?? ''
}

export function authRequired(): boolean {
  return accessPassword().length > 0
}

function parseCookie(header: string | null): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map((p) => {
      const [k, ...v] = p.trim().split('=')
      return [k, v.join('=')]
    }),
  )
}

export async function authorizeRequest(request: Request): Promise<Response | null> {
  if (!authRequired()) return null

  const bearer = request.headers.get('authorization')
  if (bearer === `Bearer ${accessPassword()}`) return null

  const cookies = parseCookie(request.headers.get('cookie'))
  if (await isValidSession(cookies.taxprime_session)) return null

  return Response.json(
    { error: 'Unauthorized. Log in or send Authorization: Bearer <access password>.' },
    { status: 401 },
  )
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `taxprime_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400${secure}`
}