'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  contentId: string
  contentType: 'movie' | 'tv_show' | 'youtube'
  initialFavorited?: boolean
}

export function FavoriteButton({ contentId, contentType, initialFavorited = false }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const prev = favorited
    setFavorited(!prev)
    try {
      const res = await fetch('/api/favorites', {
        method: prev ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType }),
      })
      if (!res.ok) setFavorited(prev)
    } catch {
      setFavorited(prev)
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
        favorited
          ? 'bg-red-900/20 border-red-700/50 text-red-400 hover:bg-red-900/30'
          : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-red-700/50 hover:text-red-400'
      )}
    >
      <Heart className={cn('w-4 h-4 transition-all', favorited && 'fill-red-400')} />
      {favorited ? 'Favorited' : 'Favorite'}
    </button>
  )
}
