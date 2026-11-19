import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function MarketingChrome({ children }: { children: ReactNode }) {
  return (
    <div className="tp-marketing min-h-screen flex flex-col">
      <header className="border-b border-white/10 bg-[#0f2436]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold tracking-tight text-white">
            TAX<span className="text-[#62d4c7]">-PRIME</span>
          </Link>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-[#8eb4c9]">
            V2 · Research intelligence
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-lg text-[#d5e5ee] hover:bg-white/10 transition"
            >
              Sign in
            </Link>
            <Link
              to="/$space/$module"
              params={{ space: 'demo', module: 'dashboard' }}
              className="text-sm px-4 py-2 rounded-lg bg-[#087f80] text-white hover:bg-[#07696a] transition font-medium"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 text-[#8eb4c9] text-xs px-5 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <p>Public aggregate research only · No operational tax authority</p>
          <p>Groq advisory layer · Treasury &amp; FRED connectors · Versioned forecasts</p>
        </div>
      </footer>
    </div>
  )
}