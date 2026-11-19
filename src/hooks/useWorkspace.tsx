import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role, WorkspaceId, WorkspaceState } from '~/lib/types'
import {
  STORAGE_KEY,
  freshWorkspace,
  logAudit,
  migrateWorkspace,
} from '~/lib/workspace'
import { apiFetch } from '~/lib/api-fetch'

type Ctx = {
  space: WorkspaceId
  role: Role
  state: WorkspaceState
  setRole: (r: Role) => void
  patch: (fn: (s: WorkspaceState) => void) => void
  reset: () => void
  syncFromServer: () => Promise<void>
  pushToServer: () => Promise<void>
}

const WorkspaceContext = createContext<Ctx | null>(null)

export function WorkspaceProvider({
  space,
  children,
}: {
  space: WorkspaceId
  children: ReactNode
}) {
  const [role, setRole] = useState<Role>('Analyst')
  const [state, setState] = useState<WorkspaceState>(() => {
    if (typeof window === 'undefined') return freshWorkspace(space === 'demo')
    try {
      const raw = localStorage.getItem(STORAGE_KEY(space))
      return migrateWorkspace(
        raw ? (JSON.parse(raw) as WorkspaceState) : freshWorkspace(space === 'demo'),
      )
    } catch {
      return freshWorkspace(space === 'demo')
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY(space), JSON.stringify(state))
    } catch {
      /* quota */
    }
  }, [space, state])

  const patch = useCallback((fn: (s: WorkspaceState) => void) => {
    setState((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setState(freshWorkspace(space === 'demo'))
  }, [space])

  const syncFromServer = useCallback(async () => {
    const res = await apiFetch(`/api/workspace/${space}`)
    if (!res.ok) return
    const data = (await res.json()) as WorkspaceState
    setState(migrateWorkspace(data))
  }, [space])

  const pushToServer = useCallback(async () => {
    await apiFetch(`/api/workspace/${space}`, {
      method: 'PUT',
      body: JSON.stringify(state),
    })
  }, [space, state])

  const value = useMemo(
    () => ({ space, role, state, setRole, patch, reset, syncFromServer, pushToServer }),
    [space, role, state, patch, reset, syncFromServer, pushToServer],
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace outside provider')
  return ctx
}

export { logAudit }