'use client'
import { useState } from 'react'
import { Search, X, Film, Tv, Youtube, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/hooks/useSearch'
import { ContentCard } from '@/components/shared/ContentCard'
import { YoutubeCard } from '@/components/shared/YoutubeCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ContentCardSkeleton } from '@/components/shared/Skeleton'
import { cn } from '@/lib/utils/cn'
import type { AnyContent } from '@/types'

type Tab = 'all' | 'movies' | 'tv' | 'youtube'

const GENRES = [
  { name: 'Action' }, { name: 'Comedy' }, { name: 'Drama' }, { name: 'Horror' },
  { name: 'Sci-Fi' }, { name: 'Thriller' }, { name: 'Romance' }, { name: 'Documentary' },
  { name: 'Animation' }, { name: 'Mystery' },
]

const YT_TOPICS = [
  'Stand up comedy', 'Documentary film', 'Science explained',
  'Short film', 'Tech review', 'Cooking tutorial', 'True crime',
  'Nature documentary',
]

export default function SearchPage() {
  const { query, setQuery, results, isFetching, hasResults, sources, setSources } = useSearch()
  const [tab, setTab] = useState<Tab>('all')

  const movies   = results?.movies        ?? []
  const tvShows  = results?.tvShows       ?? []
  const ytVideos = results?.youtubeVideos ?? []

  const allContent: AnyContent[] = [
    ...movies, ...tvShows, ...ytVideos,
  ].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

  const displayed: AnyContent[] =
    tab === 'movies'  ? movies :
    tab === 'tv'      ? tvShows :
    tab === 'youtube' ? ytVideos :
    allContent

  const totalCount = movies.length + tvShows.length + ytVideos.length
  const showEmpty  = !isFetching && query.length >= 2 && !hasResults
  const showIdle   = !query || query.length < 2
  const showSkel   = isFetching && !hasResults

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Movies · Series · YouTube videos
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search anything…"
          autoFocus
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl pl-12 pr-12 py-4 text-base outline-none transition-colors placeholder:text-[var(--text-muted)]"
        />
        {isFetching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] animate-spin" />
        )}
        {!isFetching && query && (
          <button onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Source filter */}
      <div className="flex gap-2">
        {(['all', 'tmdb', 'youtube'] as const).map(s => (
          <button key={s} onClick={() => setSources(s)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
              sources === s
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
            )}>
            {s === 'all' ? 'All sources' : s === 'tmdb' ? '🎬 Movies & TV' : '▶️ YouTube'}
          </button>
        ))}
      </div>

      {/* Idle state — genre + YouTube quick picks */}
      {showIdle && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Browse by genre</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g.name} onClick={() => setQuery(g.name)}
                  className="glass border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-sm px-4 py-2 rounded-xl transition-all">
                  {g.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube topics
            </p>
            <div className="flex flex-wrap gap-2">
              {YT_TOPICS.map(t => (
                <button key={t} onClick={() => { setQuery(t); setSources('youtube') }}
                  className="bg-red-900/10 border border-red-900/30 hover:border-red-500 text-red-400 hover:text-red-300 text-sm px-4 py-2 rounded-xl transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {hasResults && (
        <div className="flex gap-1 p-1 glass rounded-xl border border-[var(--border)] w-fit flex-wrap">
          {([
            { id: 'all',     label: 'All',    count: totalCount },
            { id: 'movies',  label: 'Movies', icon: Film,    count: movies.length },
            { id: 'tv',      label: 'Series', icon: Tv,      count: tvShows.length },
            { id: 'youtube', label: 'YouTube',icon: Youtube, count: ytVideos.length },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? t.id === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}>
              {'icon' in t && t.icon && <t.icon className="w-4 h-4" />}
              {t.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-white/20' : 'bg-[var(--bg-card)]')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {showSkel ? (
          <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ContentCardSkeleton key={i} />)}
          </motion.div>
        ) : showEmpty ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState icon={Search} title={`No results for "${query}"`}
              description="Try different keywords or browse by genre above." />
          </motion.div>
        ) : showIdle ? null : (
          <motion.div key={`${query}-${tab}-${sources}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {/* YouTube results get wide cards */}
            {tab === 'youtube' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ytVideos.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <YoutubeCard video={v} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayed.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ContentCard content={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hasResults && !isFetching && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          {results?.totalMovies ?? 0} movies · {results?.totalTv ?? 0} series · {results?.totalYoutube ?? 0} YouTube videos
        </p>
      )}
    </div>
  )
}
