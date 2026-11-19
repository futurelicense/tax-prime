import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiFetch } from '~/lib/api-fetch'
import { Btn } from '~/components/ui'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  head: () => ({
    meta: [{ title: 'Sign in | TAX-PRIME' }],
  }),
})

function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authRequired, setAuthRequired] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    void apiFetch('/api/auth/session')
      .then((r) => r.json())
      .then((d: { authRequired?: boolean; authenticated?: boolean }) => {
        setAuthRequired(d.authRequired ?? false)
        if (d.authenticated) {
          navigate({ to: '/$space/$module', params: { space: 'demo', module: 'dashboard' } })
        }
      })
      .catch(() => setAuthRequired(false))
  }, [navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }
    navigate({ to: '/$space/$module', params: { space: 'demo', module: 'dashboard' } })
  }

  const enterWithoutAuth = () => {
    navigate({ to: '/$space/$module', params: { space: 'demo', module: 'dashboard' } })
  }

  return (
    <div className="tp-login min-h-screen grid lg:grid-cols-2">
      <div className="tp-login-hero hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <Link to="/" className="text-xl font-semibold relative z-10">
          TAX<span className="text-[#62d4c7]">-PRIME</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="text-[#62d4c7] text-xs tracking-[0.2em] uppercase mb-3">Secure research access</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Evidence-linked forecasts, review queues, and audit history — in one workspace.
          </h1>
          <p className="mt-4 text-[#b8d4e3] text-sm leading-relaxed">
            Server-side Treasury sync, optional FRED macro data, and Groq explanations grounded on your
            saved runs. Numerical authority stays in deterministic code paths.
          </p>
        </div>
        <p className="text-[#8eb4c9] text-xs relative z-10">Research prototype · Not institutional authorization</p>
        <div className="tp-hero-glow opacity-80" aria-hidden />
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-10 bg-[#f5f7fa]">
        <div className="lg:hidden mb-8">
          <Link to="/" className="text-lg font-semibold text-[#122d43]">
            ← TAX<span className="text-[#087f80]">-PRIME</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-[#122d43] tracking-tight">Welcome back</h2>
          <p className="text-[#64778a] mt-1 mb-8">
            {authRequired === false
              ? 'No access password is configured — you may enter the workspace directly (development).'
              : 'Enter your deployment access password to continue.'}
          </p>

          {authRequired === false ? (
            <div className="space-y-4">
              <Btn primary onClick={enterWithoutAuth} className="w-full justify-center">
                Continue to workspace
              </Btn>
              <p className="text-xs text-[#64778a] text-center">
                Set <code>TAX_PRIME_ACCESS_PASSWORD</code> in production.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} className="space-y-4">
              <label className="grid gap-2 text-xs text-[#53677a]">
                Access password
                <input
                  type="password"
                  className="border border-[#d5dfe8] rounded-lg px-3 py-3 bg-white text-[#182a3b]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </label>
              {error ? (
                <p className="text-[#ae3c3c] text-sm bg-[#fbe8e8] border border-[#f0d0d0] rounded-lg px-3 py-2">
                  {error}
                </p>
              ) : null}
              <Btn primary type="submit" className="w-full justify-center">
                Sign in
              </Btn>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#e0e6ed] flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-[#087f80] hover:underline">
              Back to home
            </Link>
            <Link
              to="/$space/$module"
              params={{ space: 'research', module: 'dashboard' }}
              className="text-[#64778a] hover:text-[#087f80]"
            >
              Public research mode →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}