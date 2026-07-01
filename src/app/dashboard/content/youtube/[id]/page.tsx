import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Eye, Clock, Calendar, ExternalLink, Youtube, ThumbsUp, Bookmark } from 'lucide-react'
import { getYoutubeVideoDetail, getYoutubePopular } from '@/lib/youtube/queries'
import { YoutubeCard } from '@/components/shared/YoutubeCard'
import { FavoriteButton } from '@/components/dashboard/FavoriteButton'
import { WatchlistButton } from '@/components/dashboard/WatchlistButton'
import { formatRuntime } from '@/lib/utils/format'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const video = await getYoutubeVideoDetail(id)
  if (!video) return { title: 'Not Found' }
  return {
    title: video.title,
    description: video.overview?.slice(0, 160),
  }
}

function formatViews(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export default async function YoutubeDetailPage({ params }: Props) {
  const { id } = await params
  const [video, related] = await Promise.all([
    getYoutubeVideoDetail(id),
    getYoutubePopular('24', 6),
  ])

  if (!video) notFound()

  return (
    <div className="space-y-8 pb-16">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Embedded player */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-black aspect-video w-full">
        <iframe
          src={`${video.embedUrl}?autoplay=0&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Title + meta */}
      <div>
        {/* YouTube badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            <Youtube className="w-3.5 h-3.5" /> YouTube
          </span>
          {video.genres.slice(0, 2).map(g => (
            <span key={g.id} className="text-xs bg-red-900/20 text-red-400 border border-red-900/30 px-3 py-1 rounded-full">
              {g.name}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{video.title}</h1>

        {/* Channel */}
        <p className="mt-2 text-[var(--text-secondary)] font-medium">{video.channelTitle}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--text-secondary)]">
          {video.viewCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <strong className="text-[var(--text-primary)]">{formatViews(video.viewCount)}</strong> views
            </span>
          )}
          {video.likeCount && video.likeCount > 0 && (
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4" />
              <strong className="text-[var(--text-primary)]">{formatViews(video.likeCount)}</strong> likes
            </span>
          )}
          {video.durationMins > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatRuntime(video.durationMins)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(video.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <FavoriteButton contentId={video.videoId} contentType="youtube" />
          <WatchlistButton contentId={video.videoId} contentType="youtube" />
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Youtube className="w-4 h-4" /> Watch on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`https://www.youtube.com/channel/${video.channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Visit channel
          </Link>
          <Link
            href={`/dashboard/feedback?contentId=${video.videoId}&type=youtube`}
            className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <ThumbsUp className="w-4 h-4" /> Rate
          </Link>
        </div>
      </div>

      {/* Description */}
      {video.overview && (
        <div className="glass border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-3">Description</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line text-sm">
            {video.overview}
          </p>
        </div>
      )}

      {/* Tags */}
      {video.tags.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {video.tags.slice(0, 20).map(tag => (
              <Link
                key={tag}
                href={`/dashboard/search?q=${encodeURIComponent(tag)}`}
                className="text-xs glass border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-3 py-1.5 rounded-full transition-all"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More from YouTube */}
      {related.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">More from YouTube</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {related.filter(v => v.videoId !== video.videoId).slice(0, 6).map(v => (
              <YoutubeCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
