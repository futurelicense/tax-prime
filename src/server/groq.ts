import { serverEnv } from './env'

export async function groqComplete(system: string, user: string) {
  const { groqKey, groqModel } = serverEnv()
  if (!groqKey) throw new Error('GROQ_API_KEY is not configured on the server.')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq HTTP ${res.status}: ${err.slice(0, 200)}`)
  }
  const j = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  return j.choices?.[0]?.message?.content?.trim() || 'No response.'
}