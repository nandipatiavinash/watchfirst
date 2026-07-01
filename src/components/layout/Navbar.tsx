'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Search, Bell, User, Menu, X, Settings, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/dashboard',           label: 'Home' },
  { href: '/dashboard/recommend', label: 'Recommend' },
  { href: '/dashboard/search',    label: 'Search' },
  { href: '/dashboard/history',   label: 'History' },
  { href: '/dashboard/favorites', label: 'Favorites' },
]

export function Navbar() {
  const pathname    = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center glow group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">WatchFast</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]'
              )}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link href="/dashboard/search" className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors lg:hidden">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/settings" className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/profile" className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <button
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="lg:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className={cn(
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}>
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard/lists" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm text-[var(--text-secondary)]">Lists</Link>
          <Link href="/dashboard/admin" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <Shield className="w-4 h-4" /> Admin
          </Link>
        </div>
      )}
    </header>
  )
}
