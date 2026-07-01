'use client'
import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  contentId: string
  contentType: 'movie' | 'tv_show' | 'youtube'
  initialSaved?: boolean
}

export function WatchlistButton({ contentId, contentType, initialSaved = false }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const prev = saved
    setSaved(!prev)
    try {
      const res = await fetch('/api/lists/watchlist', {
        method: prev ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType }),
      })
      if (!res.ok) setSaved(prev)
    } catch {
      setSaved(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all',
        saved
          ? 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)]'
          : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]'
      )}
    >
      <Bookmark className={cn('w-4 h-4 transition-all', saved && 'fill-[var(--accent)]')} />
      {saved ? 'Saved' : 'Watchlist'}
    </button>
  )
}
