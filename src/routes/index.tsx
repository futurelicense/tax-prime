import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '~/components/marketing/LandingPage'

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: 'TAX-PRIME | Predictive tax administration research',
      },
      {
        name: 'description',
        content:
          'Traceable revenue intelligence: MODEL, PREDICT, ASSESS, DELIVER with Treasury data, FRED, and governed Groq AI.',
      },
    ],
  }),
})