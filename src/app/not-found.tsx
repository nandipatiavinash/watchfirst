import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/20 flex items-center justify-center mb-6">
        <Zap className="w-10 h-10 text-[var(--accent)]" />
      </div>
      <h1 className="text-7xl font-extrabold gradient-text mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page not found</h2>
      <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
        This page doesn't exist. Maybe it was removed, or you followed a bad link.
      </p>
      <Link href="/dashboard" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium px-6 py-3 rounded-xl transition-colors">
        Go home
      </Link>
    </div>
  )
}
