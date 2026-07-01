'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Trash2, Youtube } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { tmdbImage } from '@/lib/utils/tmdb-image'
import { EmptyState } from '@/components/shared/EmptyState'
import { ContentCardSkeleton } from '@/components/shared/Skeleton'

interface FavEntry {
  id:      string
  movie?:  { id: string; title: string; posterPath: string | null; rating: number | null } | null
  tvShow?: { id: string; title: string; posterPath: string | null; rating: number | null } | null
  youtubeVideo?: { videoId: string; title: string; thumbnailUrl: string; channelTitle: string } | null
}

export default function FavoritesPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ favorites: FavEntry[] }>({
    queryKey: ['favorites'],
    queryFn:  () => fetch('/api/favorites').then(r => r.json()),
  })

  const remove = useMutation({
    mutationFn: ({ contentId, contentType }: { contentId: string; contentType: string }) =>
      fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })

  const favorites = data?.favorites ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" /> Favorites
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Movies, shows, and videos you loved</p>
        </div>
        {favorites.length > 0 && (
          <span className="text-sm text-[var(--text-muted)]">{favorites.length} saved</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ContentCardSkeleton key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any movie, show, or video to save it here."
          action={
            <Link href="/dashboard/search"
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Browse content
            </Link>
          }
        />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map(fav => {
              // YouTube favorite
              if (fav.youtubeVideo) {
                const yt = fav.youtubeVideo
                return (
                  <motion.div key={fav.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group">
                    <Link href={`/dashboard/content/youtube/${yt.videoId}`}>
                      <div className="rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] card-hover">
                        <div className="relative aspect-video">
                          {yt.thumbnailUrl
                            ? <Image src={yt.thumbnailUrl} alt={yt.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" />
                            : <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center"><Youtube className="w-8 h-8 text-red-500" /></div>}
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Youtube className="w-3 h-3" /> YouTube
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm line-clamp-2">{yt.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{yt.channelTitle}</p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => remove.mutate({ contentId: yt.videoId, contentType: 'youtube' })}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur p-1.5 rounded-lg text-red-400 hover:bg-red-900/40 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )
              }

              // Movie / TV favorite
              const content = fav.movie ?? fav.tvShow
              if (!content) return null
              const type        = fav.movie ? 'movie' : 'tv_show'
              const displayType = fav.movie ? 'movie' : 'tv'
              const poster      = tmdbImage(content.posterPath, 'w342')

              return (
                <motion.div key={fav.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group">
                  <Link href={`/dashboard/content/${displayType}/${content.id}`}>
                    <div className="rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] card-hover">
                      <div className="relative aspect-[2/3]">
                        {poster
                          ? <Image src={poster} alt={content.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" />
                          : <div className="w-full h-full bg-[var(--bg-secondary)]" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm line-clamp-1">{content.title}</p>
                        {content.rating && (
                          <p className="text-xs text-yellow-400 mt-1">★ {content.rating.toFixed(1)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove.mutate({ contentId: content.id, contentType: type })}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur p-1.5 rounded-lg text-red-400 hover:bg-red-900/40 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
