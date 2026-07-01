import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent)] opacity-10 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center glow">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="font-bold text-xl gradient-text">WatchFast AI</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-[var(--border)]">
        {children}
      </div>
    </div>
  )
}
