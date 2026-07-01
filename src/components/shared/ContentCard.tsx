'use client'
import type { AnyContent } from '@/types'
import { YoutubeCard } from './YoutubeCard'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { tmdbImage } from '@/lib/utils/tmdb-image'
import { formatRuntime } from '@/lib/utils/format'
import type { MovieContent, TvShowContent } from '@/types'

interface ContentCardProps {
  content:      AnyContent
  href?:        string
  showScore?:   boolean
  score?:       number
  explanation?: string
  className?:   string
}

function TmdbCard({
  content, href, showScore, score, explanation, className,
}: {
  content: MovieContent | TvShowContent
  href?: string; showScore?: boolean; score?: number; explanation?: string; className?: string
}) {
  const poster  = tmdbImage(content.posterPath, 'w342')
  const runtime = content.type === 'movie' ? content.runtimeMins : content.episodeRuntime
  const link    = href ?? `/dashboard/content/${content.type === 'movie' ? 'movie' : 'tv'}/${content.id}`

  return (
    <Link href={link} className={cn('group block', className)}>
      <div className="relative rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] card-hover">
        <div className="relative aspect-[2/3] overflow-hidden">
          {poster ? (
            <Image
              src={poster} alt={content.title} fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
              <span className="text-[var(--text-muted)] text-xs">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {showScore && score !== undefined && (
            <div className="absolute top-2 right-2 bg-[var(--accent)] text-white text-xs font-bold px-2 py-1 rounded-full">
              {Math.round(score * 100)}%
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-xs text-[var(--text-secondary)] px-2 py-1 rounded-full">
            {content.type === 'movie' ? 'Movie' : 'Series'}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {content.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-secondary)]">
            {content.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {content.rating.toFixed(1)}
              </span>
            )}
            {runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRuntime(runtime)}
              </span>
            )}
          </div>
          {content.genres.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {content.genres.slice(0, 2).map(g => (
                <span key={g.id} className="text-xs bg-[var(--bg-glass)] text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                  {g.name}
                </span>
              ))}
            </div>
          )}
          {explanation && (
            <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2 italic">{explanation}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ContentCard({ content, href, showScore, score, explanation, className }: ContentCardProps) {
  if (content.type === 'youtube') {
    return (
      <YoutubeCard
        video={content}
        showScore={showScore}
        score={score}
        explanation={explanation}
        className={className}
      />
    )
  }
  return (
    <TmdbCard
      content={content}
      href={href}
      showScore={showScore}
      score={score}
      explanation={explanation}
      className={className}
    />
  )
}
