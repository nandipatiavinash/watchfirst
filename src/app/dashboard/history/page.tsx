'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Trash2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { tmdbImage } from '@/lib/utils/tmdb-image'
import { formatDate } from '@/lib/utils/format'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'

interface HistoryEntry {
  id:         string
  watchedAt:  string
  completed:  boolean
  progressPct: number | null
  movie?:     { id: string; title: string; posterPath: string | null; releaseDate: string | null } | null
  tvShow?:    { id: string; title: string; posterPath: string | null } | null
}

export default function HistoryPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ history: HistoryEntry[] }>({
    queryKey: ['history'],
    queryFn:  () => fetch('/api/history').then(r => r.json()),
  })

  const del = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/history/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }),
  })

  const history = data?.history ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--accent)]" /> Watch History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Everything you've watched</p>
        </div>
        {history.length > 0 && (
          <span className="text-sm text-[var(--text-muted)]">{history.length} entries</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No watch history yet"
          description="Start watching something and it'll appear here."
          action={
            <Link href="/dashboard/recommend"
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Get a recommendation
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {history.map(entry => {
            const content = entry.movie ?? entry.tvShow
            if (!content) return null
            const type = entry.movie ? 'movie' : 'tv'
            const poster = tmdbImage(content.posterPath, 'w92')

            return (
              <div key={entry.id}
                className="flex items-center gap-4 glass border border-[var(--border)] rounded-xl p-3 group hover:border-[var(--border-hover)] transition-all">
                {/* Poster */}
                <Link href={`/dashboard/content/${type}/${content.id}`} className="shrink-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-[var(--bg-card)]">
                    {poster
                      ? <Image src={poster} alt={content.title} width={48} height={64} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[var(--bg-secondary)]" />}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/content/${type}/${content.id}`}>
                    <p className="font-semibold truncate hover:text-[var(--accent)] transition-colors">
                      {content.title}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(entry.watchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {entry.completed && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {!entry.completed && entry.progressPct != null && (
                      <span className="text-xs text-[var(--text-muted)]">{entry.progressPct}% watched</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  {entry.progressPct != null && !entry.completed && (
                    <div className="mt-2 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden w-48">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${entry.progressPct}%` }} />
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <span className="text-xs text-[var(--text-muted)] capitalize shrink-0">{type}</span>

                {/* Delete */}
                <button
                  onClick={() => del.mutate(entry.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
