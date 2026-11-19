import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { WorkspaceId, WorkspaceState } from '~/lib/types'
import { freshWorkspace, migrateWorkspace } from '~/lib/workspace'

const dir = () => path.join(process.cwd(), '.data', 'workspaces')

function fileFor(space: WorkspaceId) {
  return path.join(dir(), `${space}.json`)
}

export async function loadWorkspaceServer(space: WorkspaceId): Promise<WorkspaceState> {
  try {
    const raw = await readFile(fileFor(space), 'utf8')
    return migrateWorkspace(JSON.parse(raw) as WorkspaceState)
  } catch {
    return freshWorkspace(space === 'demo')
  }
}

export async function saveWorkspaceServer(
  space: WorkspaceId,
  state: WorkspaceState,
): Promise<void> {
  await mkdir(dir(), { recursive: true })
  await writeFile(fileFor(space), JSON.stringify(state, null, 2), 'utf8')
}