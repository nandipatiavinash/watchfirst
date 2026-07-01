'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Eye, Clock, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRuntime } from '@/lib/utils/format'
import type { YoutubeContent } from '@/types'

interface YoutubeCardProps {
  video:       YoutubeContent
  showScore?:  boolean
  score?:      number
  explanation?: string
  className?:  string
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function YoutubeCard({ video, showScore, score, explanation, className }: YoutubeCardProps) {
  return (
    <Link
      href={`/dashboard/content/youtube/${video.videoId}`}
      className={cn('group block', className)}
    >
      <div className="rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] card-hover">

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Youtube className="w-10 h-10 text-red-500" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration pill */}
          {video.durationMins > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
              {formatRuntime(video.durationMins)}
            </div>
          )}

          {/* YouTube badge */}
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Youtube className="w-3 h-3" /> YouTube
          </div>

          {/* Score badge */}
          {showScore && score !== undefined && (
            <div className="absolute top-2 right-2 bg-[var(--accent)] text-white text-xs font-bold px-2 py-1 rounded-full">
              {Math.round(score * 100)}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{video.channelTitle}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
            {video.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {formatViews(video.viewCount)}
              </span>
            )}
            {video.durationMins > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatRuntime(video.durationMins)}
              </span>
            )}
          </div>

          {/* Genre tags */}
          {video.genres.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {video.genres.slice(0, 2).map(g => (
                <span key={g.id} className="text-xs bg-red-900/20 text-red-400 border border-red-900/30 px-2 py-0.5 rounded-full">
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
