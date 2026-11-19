import { createFileRoute } from '@tanstack/react-router'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const file = path.join(process.cwd(), 'public', 'samples', 'sample-revenue.csv')

export const Route = createFileRoute('/samples/sample-revenue.csv')({
  server: {
    handlers: {
      GET: async () => {
        const body = await readFile(file, 'utf8')
        return new Response(body, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="sample-revenue.csv"',
          },
        })
      },
    },
  },
})