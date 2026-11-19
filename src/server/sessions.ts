import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const file = () => path.join(process.cwd(), '.data', 'sessions.json')

async function load(): Promise<Set<string>> {
  try {
    const raw = await readFile(file(), 'utf8')
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

async function save(tokens: Set<string>) {
  await mkdir(path.dirname(file()), { recursive: true })
  await writeFile(file(), JSON.stringify([...tokens]), 'utf8')
}

export async function createSession(): Promise<string> {
  const tokens = await load()
  const token = randomUUID()
  tokens.add(token)
  await save(tokens)
  return token
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const tokens = await load()
  return tokens.has(token)
}

export async function revokeSession(token: string | undefined) {
  if (!token) return
  const tokens = await load()
  tokens.delete(token)
  await save(tokens)
}