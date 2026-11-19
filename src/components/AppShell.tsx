import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '~/lib/api-fetch'
import { MODULES } from '~/lib/modules'
import type { WorkspaceId } from '~/lib/types'
import { WorkspaceProvider, useWorkspace } from '~/hooks/useWorkspace'

function ShellInner({ module, children }: { module: string; children: ReactNode }) {
  const { space, role, setRole } = useWorkspace()
  const mod = MODULES.find((m) => m.slug === module) ?? MODULES[0]

  return (
    <div className="min-h-screen flex">
      <aside className="fixed inset-y-0 left-0 w-[244px] bg-[#122d43] text-[#e8f3f7] p-4 overflow-auto">
        <h2 className="text-2xl mx-2">
          TAX<span className="text-[#62d4c7]">-PRIME</span>
        </h2>
        <small className="text-[#98b9ca] mx-2 block">V2.0 · Research intelligence</small>
        <nav className="mt-6">
          {MODULES.map((m) => (
            <div key={m.slug}>
              {m.group ? (
                <p className="text-[10px] tracking-widest text-[#92b1c5] mx-2.5 mt-4 mb-1.5">
                  {m.group}
                </p>
              ) : null}
              <Link
                to="/$space/$module"
                params={{ space, module: m.slug }}
                className={`block w-full text-left border-0 px-2.5 py-2 text-[13px] rounded ${
                  m.slug === module
                    ? 'bg-[#24516a] text-white'
                    : 'text-[#d5e5ee] hover:bg-[#24516a] hover:text-white'
                }`}
              >
                {m.icon} &nbsp;{m.name}
              </Link>
            </div>
          ))}
        </nav>
      </aside>
      <main className="ml-[244px] flex-1 min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b border-[#e1e7ee] px-6 py-3 flex flex-wrap items-center gap-3">
          <strong className="mr-auto">Workspace / {mod.name}</strong>
          <select
            className="border border-[#d5dfe8] rounded-md px-2 py-2"
            value={space}
            onChange={(e) => {
              const v = e.target.value as WorkspaceId
              window.location.href = `/${v}/${module}`
            }}
          >
            <option value="demo">Simulation workspace</option>
            <option value="research">Public research workspace</option>
          </select>
          <select
            className="border border-[#d5dfe8] rounded-md px-2 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
          >
            <option>Analyst</option>
            <option>Reviewer</option>
            <option>Administrator</option>
          </select>
          <Link
            to="/$space/$module"
            params={{ space, module: 'copilot' }}
            className="border border-[#d5dfe8] px-3 py-2 rounded-md text-sm hover:bg-[#e8f4f2]"
          >
            ✧ Copilot
          </Link>
        </header>
        <section className="px-7 py-6 max-w-[1500px] mx-auto">{children}</section>
      </main>
    </div>
  )
}

function AuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    void apiFetch('/api/auth/session')
      .then((r) => r.json())
      .then((d: { authRequired?: boolean; authenticated?: boolean }) => {
        if (d.authRequired && !d.authenticated) {
          navigate({ to: '/login' })
          return
        }
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [navigate])
  if (!ready) return <p className="p-8 text-[#64778a]">Checking session…</p>
  return children
}

export function AppShell({ children }: { children: ReactNode }) {
  const { space, module } = useParams({ strict: false }) as {
    space: WorkspaceId
    module: string
  }
  const safeSpace: WorkspaceId = space === 'research' ? 'research' : 'demo'

  return (
    <AuthGate>
      <WorkspaceProvider space={safeSpace} key={safeSpace}>
        <ShellInner module={module || 'dashboard'}>{children}</ShellInner>
      </WorkspaceProvider>
    </AuthGate>
  )
}