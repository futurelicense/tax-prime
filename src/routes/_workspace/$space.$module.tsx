import { createFileRoute } from '@tanstack/react-router'
import { ModuleView } from '~/components/ModuleView'
import type { ModuleSlug } from '~/lib/modules'

export const Route = createFileRoute('/_workspace/$space/$module')({
  component: Page,
})

function Page() {
  const { module } = Route.useParams()
  const slug = (module in slugSet ? module : 'dashboard') as ModuleSlug
  return <ModuleView module={slug} />
}

const slugSet: Record<string, true> = {
  dashboard: true,
  workflow: true,
  'live-test': true,
  'data-hub': true,
  explorer: true,
  model: true,
  predict: true,
  scenario: true,
  prioritize: true,
  optimize: true,
  copilot: true,
  governance: true,
  reports: true,
  validation: true,
}