import { Link } from '@tanstack/react-router'
import { MarketingChrome } from './MarketingChrome'

const STAGES = [
  { n: '01', title: 'MODEL', desc: 'Risk taxonomy, features, exclusions, versioned assumptions.' },
  { n: '02', title: 'PREDICT', desc: 'Reproducible aggregate forecasts with transparent baselines.' },
  { n: '03', title: 'ASSESS', desc: 'Prioritization and capacity-constrained optimization (synthetic).' },
  { n: '04', title: 'DELIVER', desc: 'Reviewed briefs, Groq-grounded explanations, audit trail.' },
] as const

const SOURCES = [
  'U.S. Treasury Revenue Collections',
  'FRED / macro covariates',
  'File import (IRS SOI–class aggregates)',
  'Groq research copilot (server-side)',
] as const

export function LandingPage() {
  return (
    <MarketingChrome>
      <section className="tp-hero relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28 relative z-10">
          <p className="text-[#62d4c7] text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Tax administration · predictive intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight max-w-3xl leading-[1.08]">
            Turn public revenue evidence into{' '}
            <span className="text-[#7ee8dc]">traceable</span> research decisions.
          </h1>
          <p className="mt-6 text-lg text-[#b8d4e3] max-w-2xl leading-relaxed">
            TAX-PRIME V2 operationalizes MODEL → PREDICT → ASSESS → DELIVER with provenance,
            human review, and server-governed AI — built for analysts, not automated enforcement.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-[#087f80] text-white font-medium hover:bg-[#0a9495] shadow-lg shadow-[#087f80]/30 transition"
            >
              Sign in to workspace
            </Link>
            <Link
              to="/$space/$module"
              params={{ space: 'demo', module: 'live-test' }}
              className="inline-flex items-center px-6 py-3 rounded-lg border border-white/25 text-white hover:bg-white/10 transition"
            >
              Open integration test lab
            </Link>
          </div>
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { k: '12', l: 'Research modules' },
              { k: '2', l: 'Workspace modes' },
              { k: 'API', l: 'Treasury + FRED' },
              { k: '§6.4', l: 'Governed Groq layer' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-white/12 bg-white/5 backdrop-blur px-4 py-5"
              >
                <div className="text-2xl font-semibold text-white">{s.k}</div>
                <div className="text-[#8eb4c9] text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="tp-hero-glow" aria-hidden />
      </section>

      <section className="bg-[#122d43] py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-semibold text-white mb-2">Four-stage intelligence cycle</h2>
          <p className="text-[#8eb4c9] mb-10 max-w-xl">
            Same methodology as the V1 framework — now with connectors, versioning, and audit.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((s) => (
              <article
                key={s.n}
                className="rounded-xl border border-[#24516a] bg-[#0f2436] p-5 hover:border-[#62d4c7]/40 transition"
              >
                <span className="text-[#62d4c7] text-xs font-bold tracking-widest">{s.n}</span>
                <h3 className="text-white font-semibold mt-2">{s.title}</h3>
                <p className="text-[#8eb4c9] text-sm mt-2 leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-light-band py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#122d43]">Data foundation you can cite</h2>
            <p className="text-[#53677a] mt-3 leading-relaxed">
              Sync monthly Treasury RCM aggregates, optional FRED macro series, and CSV/JSON imports
              with checksums and snapshot IDs. Every forecast run links to source versions.
            </p>
            <ul className="mt-6 space-y-2">
              {SOURCES.map((name) => (
                <li key={name} className="flex items-center gap-2 text-[#182a3b] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#087f80]" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#e0e6ed] bg-white p-6 shadow-xl shadow-[#122d43]/5">
            <p className="text-xs uppercase tracking-widest text-[#607386] mb-4">Continuous learning</p>
            <div className="space-y-3 text-sm text-[#53677a]">
              <p>
                <strong className="text-[#122d43]">Measure → Validate → Refine</strong> — holdout
                backtests compare seasonal naïve vs moving average on your active series.
              </p>
              <p>
                <strong className="text-[#122d43]">Human review</strong> — decisions require
                rationale; reviewers approve before publication briefs.
              </p>
              <p>
                <strong className="text-[#122d43]">AI boundary</strong> — Groq explains computed
                outputs; it does not score taxpayers or select audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e5f3ef] border-y border-[#cbe4dc] py-12">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-[#206459] font-medium">
            PUBLIC / SYNTHETIC research environment · Aggregate statistics only
          </p>
          <p className="text-[#3d7a6e] text-sm mt-2 max-w-2xl mx-auto">
            Not for individual taxpayer decisions. Deploy with <code className="text-xs bg-white/60 px-1 rounded">TAX_PRIME_ACCESS_PASSWORD</code> before
            exposing to the internet.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-[#087f80] font-semibold hover:underline"
          >
            Continue to sign in →
          </Link>
        </div>
      </section>
    </MarketingChrome>
  )
}