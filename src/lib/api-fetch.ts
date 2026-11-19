export async function apiFetch(input: string, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}